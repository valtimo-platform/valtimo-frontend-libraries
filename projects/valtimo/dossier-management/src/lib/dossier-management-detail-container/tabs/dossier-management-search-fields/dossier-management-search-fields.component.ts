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
import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
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
import {
  DefinitionColumn,
  SearchField,
  SearchFieldDataType,
  SearchFieldFieldType,
  SearchFieldMatchType,
} from '@valtimo/config';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SelectItem} from '@valtimo/user-interface';

@Component({
  selector: 'valtimo-dossier-management-search-fields',
  templateUrl: './dossier-management-search-fields.component.html',
  styleUrls: ['./dossier-management-search-fields.component.scss'],
})
export class DossierManagementSearchFieldsComponent implements OnInit, OnDestroy {
  @ViewChild('editSearchFieldModal') modal: ModalComponent;
  @Output() searchField: EventEmitter<SearchField> = new EventEmitter();

  private closeResult = '';
  private selectedSearchFieldSubscription!: Subscription;

  readonly downloadName$ = new BehaviorSubject<string>('');
  readonly downloadUrl$ = new BehaviorSubject<SafeUrl>(undefined);
  readonly selectedSearchFields$ = new BehaviorSubject<string | null>(null);
  readonly onDeleteSearchField$ = new BehaviorSubject<string | null>(null);
  readonly disabled$ = new BehaviorSubject<boolean>(false);
  readonly selectedSearchField$ = new BehaviorSubject<SearchField | null>(null);
  readonly valid$ = new BehaviorSubject<boolean>(false);
  readonly formData$ = new BehaviorSubject<SearchField>(null);

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

  private readonly DATA_TYPE: Array<SearchFieldDataType> = [
    'text',
    'number',
    'date',
    'datetime',
    'boolean',
  ];
  readonly dataTypeItems$: Observable<Array<SelectItem>> = this.translateService.stream('key').pipe(
    map(() =>
      this.DATA_TYPE.map(searchFields => ({
        id: searchFields,
        text: this.translateService.instant(`searchFieldsOverview.${searchFields}`),
      }))
    )
  );

  private readonly FIELD_TYPE: Array<SearchFieldFieldType> = ['single', 'multiple', 'range'];
  readonly fieldTypeItems$: Observable<Array<SelectItem>> = this.translateService
    .stream('key')
    .pipe(
      map(() =>
        this.FIELD_TYPE.map(searchFields => ({
          id: searchFields,
          text: this.translateService.instant(`searchFieldsOverview.${searchFields}`),
        }))
      )
    );

  private readonly MATCH_TYPE: Array<SearchFieldMatchType> = ['exact', 'like'];
  readonly matchTypeItems$: Observable<Array<SelectItem>> = this.translateService
    .stream('key')
    .pipe(
      map(() =>
        this.MATCH_TYPE.map(searchFields => ({
          id: searchFields,
          text: this.translateService.instant(`searchFieldsOverview.${searchFields}`),
        }))
      )
    );

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
      map(fields => fields.sort()),
      tap(searchFields => {
        this.documentDefinitionName$.pipe(take(1)).subscribe(documentDefinitionName => {
          this.setDownload(documentDefinitionName, searchFields);
        });
      })
    );

  public index$ = new BehaviorSubject(0);

  // find index
  public elementAtIndex$ = combineLatest(
    this.index$,
    this.searchFields$,
    (index, arr) => arr[index]
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

  formValueChange(data: SearchField): void {
    this.formData$.next(data);
    this.setValid(data);
  }

  onSubmit(documentDefinitionName: string, searchFields?: SearchField): void {
    combineLatest([this.valid$, this.formData$])
      .pipe(take(1))
      .subscribe(([valid, formData]) => {
        if (valid) {
          this.searchField.emit(formData);
        }
      });
    this.documentService.postDocumentSearch(documentDefinitionName, searchFields).subscribe();
  }

  private setValid(data: SearchField): void {
    this.valid$.next(!!(data.path && data.datatype && data.fieldtype && data.matchtype));
  }

  onDelete(searchField: any): void {
    this.onDeleteSearchField$.next(searchField);
  }

  onEdit(documentDefinitionName: string, searchFields?: SearchField): void {
    this.documentService.putDocumentSearch(documentDefinitionName, searchFields).subscribe();
  }

  onCreate(documentDefinitionName: string, searchFields?: SearchField): void {
    this.documentService.postDocumentSearch(documentDefinitionName, searchFields).subscribe();
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

  private moveUp(searchFieldRow: any, clickEvent: MouseEvent): void {
    this.searchFields$.pipe(map(fields => fields.sort()));

    const allFields = [];

    const index = allFields.indexOf(searchFieldRow);
    if (index === 0) {
      return;
    }
    const moveUp = allFields[index - 1];
    allFields[index - 1] = searchFieldRow;
    allFields[index] = moveUp;

    clickEvent.stopPropagation();
  }

  searchFieldsRow: Array<SearchField>;

  private moveDown(searchFieldRow: any, clickEvent: MouseEvent): Observable<any> {
    const allFields = [];

    const index = allFields.indexOf(searchFieldRow);
    if (index === allFields.length - 1) {
      return;
    }
    const moveDown = allFields[index + 1];
    allFields[index + 1] = searchFieldRow;
    allFields[index] = moveDown;

    clickEvent.stopPropagation();
  }
}
