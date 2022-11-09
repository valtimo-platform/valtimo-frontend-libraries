/*
 * Copyright 2015-2022 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DocumentService} from '@valtimo/document';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ListField, ModalComponent} from '@valtimo/components';
import {TranslateService} from '@ngx-translate/core';
import {DefinitionColumn, SearchField} from '@valtimo/config';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'valtimo-dossier-management-search-fields',
  templateUrl: './dossier-management-search-fields.component.html',
  styleUrls: ['./dossier-management-search-fields.component.scss'],
})
export class DossierManagementSearchFieldsComponent implements OnInit, OnDestroy {
  @ViewChild('editSearchFieldModal') modal: ModalComponent;
  @ViewChild('modalConfirmationDelete') modalConfirmation: ModalComponent;

  private closeResult = '';
  private selectedSearchFieldSubscription!: Subscription;

  readonly downloadName$ = new BehaviorSubject<string>('');
  readonly downloadUrl$ = new BehaviorSubject<SafeUrl>(undefined);
  readonly selectedSearchFields$ = new BehaviorSubject<string | null>(null);
  readonly onDeleteSearchField$ = new BehaviorSubject<string | null>(null);
  readonly disabled$ = new BehaviorSubject<boolean>(false);
  readonly selectedSearchField$ = new BehaviorSubject<SearchField | null>(null);
  readonly valid$ = new BehaviorSubject<boolean>(false);

  private readonly COLUMNS: Array<DefinitionColumn> = [
    {
      viewType: 'string',
      sortable: false,
      propertyName: 'path',
      translationKey: 'path',
    },
    {
      viewType: 'string',
      sortable: false,
      propertyName: 'datatype',
      translationKey: 'datatype',
    },
    {
      viewType: 'string',
      sortable: false,
      propertyName: 'fieldtype',
      translationKey: 'fieldtype',
    },
    {
      viewType: 'string',
      sortable: false,
      propertyName: 'matchtype',
      translationKey: 'matchtype',
    },
  ];

  public readonly actions = [
    {
      columnName: 'Up',
      iconClass: 'mdi mdi-arrow-up-bold btn btn-outline-primary',
      callback: this.moveUp.bind(this),
    },
    {
      columnName: 'Down',
      iconClass: 'mdi mdi-arrow-down-bold btn btn-outline-secondary',
      callback: this.moveDown.bind(this),
    },
  ];

  private readonly TYPE_SEARCH: Array<any> = [
    {
      propertyName: 'exact',
      translationKey: 'exact',
    },
    {
      propertyName: 'like',
      translationKey: 'like',
    },
    {
      propertyName: 'range',
      translationKey: 'range',
    },
    {
      propertyName: 'both',
      translationKey: 'both',
    },
  ];

  readonly fields$: Observable<Array<ListField>> = this.translateService.stream('key').pipe(
    map(() =>
      this.COLUMNS.map(column => ({
        key: column.propertyName,
        label: this.translateService.instant(`searchFieldsOverview.${column.translationKey}`),
        sortable: column.sortable,
        ...(column.viewType && {viewType: column.viewType}),
      }))
    )
  );

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.name || ''),
    filter(docDefName => !!docDefName)
  );

  private readonly searchFields$: Observable<Array<SearchField>> =
    this.documentDefinitionName$.pipe(
      switchMap(documentDefinitionName =>
        this.documentService.getDocumentSearchFields(documentDefinitionName)
      ),
      tap(searchFields => {
        this.documentDefinitionName$.pipe(take(1)).subscribe(documentDefinitionName => {
          this.setDownload(documentDefinitionName, searchFields);
        });
      })
    );

  readonly translatedSearchFields$: Observable<Array<SearchField>> = combineLatest([
    this.searchFields$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([searchFields]) =>
      searchFields.map(searchField => ({
        ...searchField,
        datatype: this.translateService.instant(`searchFields.${searchField.datatype}`),
        matchtype: this.translateService.instant(`searchFieldsOverview.${searchField.matchtype}`),
        fieldtype: this.translateService.instant(`searchFieldsOverview.${searchField.fieldtype}`),
      }))
    )
  );

  constructor(
    private readonly documentService: DocumentService,
    private readonly route: ActivatedRoute,
    private readonly translateService: TranslateService,
    private readonly sanitizer: DomSanitizer,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.openSelectedSearchFieldSubscription();
  }

  ngOnDestroy(): void {
    this.selectedSearchFieldSubscription?.unsubscribe();
  }

  searchFieldClicked(searchField: any): void {
    this.selectedSearchField$.next(searchField);
  }

  private openSelectedSearchFieldSubscription(): void {
    this.selectedSearchFieldSubscription = this.selectedSearchField$.subscribe(searchField => {
      this.modal.show();
    });
  }

  selectedTypeSearch(searchField: any): void {
    this.selectedSearchFields$.next(searchField);
  }

  onSubmit(documentDefinitionName: string, searchFields?: SearchField): void {
    this.documentService.putDocumentSearch(documentDefinitionName, searchFields);
  }

  onDelete(searchField: any): void {
    this.onDeleteSearchField$.next(searchField);
  }

  onEdit(documentDefinitionName: string, searchFields?: SearchField): void {
    this.documentService.putDocumentSearch(documentDefinitionName, searchFields);
  }

  onCreate(documentDefinitionName: string, searchFields?: SearchField): void {
    this.documentService.postDocumentSearch(documentDefinitionName, searchFields);
  }

  private delete(documentDefinitionName: string, key: any): void {
    this.documentService.deleteDocumentSearch(documentDefinitionName, key).subscribe();
  }

  private setDownload(documentDefinitionName: string, searchFields: Array<SearchField>): void {
    this.downloadName$.next(`${documentDefinitionName}.json`);
    this.downloadUrl$.next(
      this.sanitizer.bypassSecurityTrustUrl(
        'data:text/json;charset=UTF-8,' +
          encodeURIComponent(JSON.stringify({searchFields}, null, 2))
      )
    );
  }

  open(content): void {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
      result => {
        //this.delete()
        this.closeResult = `Closed with: ${result}`;
      },
      reason => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  private moveUp(): void {
    console.log('go up');
  }

  private moveDown(): void {
    console.log('go down');
  }
}
