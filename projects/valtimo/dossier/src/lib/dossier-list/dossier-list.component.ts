/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
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
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {DefinitionColumn} from '@valtimo/config';
import {
  DocumentSearchRequest,
  DocumentSearchRequestImpl,
  DocumentService,
  SortState,
  ProcessDocumentDefinition,
  Documents,
  DocumentDefinition,
} from '@valtimo/document';
import moment from 'moment';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {DefaultTabs} from '../dossier-detail-tab-enum';
import {DossierProcessStartModalComponent} from '../dossier-process-start-modal/dossier-process-start-modal.component';
import {DossierService} from '../dossier.service';
import {Pagination, ListField} from '@valtimo/components';
import {NGXLogger} from 'ngx-logger';

// eslint-disable-next-line no-var
declare var $;

moment.locale(localStorage.getItem('langKey') || '');

@Component({
  selector: 'valtimo-dossier-list',
  templateUrl: './dossier-list.component.html',
  styleUrls: ['./dossier-list.component.css'],
})
export class DossierListComponent implements OnInit, OnDestroy {
  public documentDefinitionName = '';
  public implementationDefinitions: any;
  public showCreateDocument = false;
  public schema: any;
  public documents: Documents;
  public items: Array<any> = [];
  public fields: Array<any> = [];
  public processDefinitionListFields: Array<any> = [];
  public processDocumentDefinitions: ProcessDocumentDefinition[] = [];
  public pagination = {
    collectionSize: 0,
    page: 1,
    size: 10,
    maxPaginationItemSize: 5,
    sort: undefined,
  };
  public globalSearchFilter: string | undefined;
  public sequence: number | undefined;
  public createdBy: string | undefined;
  private selectedProcessDocumentDefinition: ProcessDocumentDefinition | null = null;
  private modalListenerAdded = false;
  @ViewChild('processStartModal') processStart: DossierProcessStartModalComponent;

  private routerSubscription: Subscription;

  private translationSubscription: Subscription;

  //

  readonly settingPaginationForDocName$ = new BehaviorSubject<string | undefined>(undefined);

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.documentDefinitionName || ''),
    tap(documentDefinitionName => {
      this.resetPagination(documentDefinitionName);
    })
  );

  readonly associatedProcessDefinitions$ = this.documentDefinitionName$.pipe(
    switchMap(documentDefinitionName =>
      documentDefinitionName
        ? this.documentService.findProcessDocumentDefinitions(documentDefinitionName)
        : of([])
    ),
    map(processDocumentDefinitions =>
      processDocumentDefinitions.filter(definition => definition.canInitializeDocument)
    )
  );

  readonly processDefinitionListFields$ = new BehaviorSubject<Array<{key: string; label: string}>>([
    {
      key: 'processName',
      label: 'Proces',
    },
  ]);

  readonly schema$ = this.documentDefinitionName$.pipe(
    switchMap(documentDefinitionName =>
      this.documentService.getDocumentDefinition(documentDefinitionName)
    ),
    map(documentDefinition => documentDefinition?.schema)
  );

  readonly storedSearchRequestKey$: Observable<string> = this.documentDefinitionName$.pipe(
    map(documentDefinitionName => `list-search-${documentDefinitionName}`)
  );

  readonly hasStoredSearchRequest$: Observable<boolean> = this.storedSearchRequestKey$.pipe(
    map(storedSearchRequestKey => localStorage.getItem(storedSearchRequestKey) !== null)
  );

  readonly columns$: Observable<Array<DefinitionColumn>> = this.documentDefinitionName$.pipe(
    map(documentDefinitionName => this.dossierService.getDefinitionColumns(documentDefinitionName))
  );

  readonly fields$: Observable<Array<ListField>> = combineLatest([
    this.columns$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([columns]) =>
      columns.map((column, index) => ({
        key: column.propertyName,
        label: this.translateService.instant(`fieldLabels.${column.translationKey}`),
        sortable: column.sortable,
        ...(column.viewType && {viewType: column.viewType}),
      }))
    )
  );

  private readonly DEFAULT_PAGINATION = {
    collectionSize: 0,
    page: 1,
    size: 10,
    maxPaginationItemSize: 5,
    sort: undefined,
  };

  private readonly pagination$ = new BehaviorSubject<Pagination | undefined>(undefined);

  readonly paginationCopy$ = this.pagination$.pipe(
    map(pagination => pagination && JSON.parse(JSON.stringify(pagination)))
  );

  readonly sequence$ = new BehaviorSubject<number | undefined>(undefined);

  readonly createdBy$ = new BehaviorSubject<string | undefined>(undefined);

  readonly globalSearchFilter$ = new BehaviorSubject<string | undefined>(undefined);

  readonly documentSearchRequest$: Observable<DocumentSearchRequest> = combineLatest([
    this.pagination$,
    this.documentDefinitionName$,
    this.sequence$,
    this.createdBy$,
    this.globalSearchFilter$,
  ]).pipe(
    filter(([pagination]) => !!pagination),
    map(
      ([pagination, documentDefinitionName, sequence, createdBy, globalSearchFilter]) =>
        new DocumentSearchRequestImpl(
          documentDefinitionName,
          pagination.page - 1,
          pagination.size,
          sequence,
          createdBy,
          globalSearchFilter,
          pagination.sort
        )
    )
  );

  readonly documentsRequest$: Observable<Documents> = this.documentSearchRequest$.pipe(
    distinctUntilChanged((prev, curr) => {
      return JSON.stringify(prev) === JSON.stringify(curr);
    }),
    tap(request => {
      this.storedSearchRequestKey$.pipe(take(1)).subscribe(storedSearchRequestKey => {
        this.logger.log(`store request in local storage: ${JSON.stringify(request)}`);
        localStorage.setItem(storedSearchRequestKey, JSON.stringify(request));
      });
    }),
    switchMap(documentSearchRequest => this.documentService.getDocuments(documentSearchRequest)),
    tap(documents => {
      this.setCollectionSize(documents);
    })
  );

  readonly documentItems$ = this.documentsRequest$.pipe(
    map(documents =>
      documents.content.map(document => {
        const {content, ...others} = document;
        return {...content, ...others};
      })
    )
  );

  initialSortState;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private readonly translateService: TranslateService,
    private readonly dossierService: DossierService,
    private readonly logger: NGXLogger
  ) {}

  ngOnInit(): void {
    this.routeEvent(this.router);
    this.modalListenerAdded = false;
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.translationSubscription.unsubscribe();
  }

  private resetPagination(documentDefinitionName): void {
    this.settingPaginationForDocName$.pipe(take(1)).subscribe(settingPaginationForDocName => {
      if (documentDefinitionName !== settingPaginationForDocName) {
        this.pagination$.next(undefined);
        this.logger.log('clear pagination');
        this.settingPaginationForDocName$.next(documentDefinitionName);
        this.setPagination(documentDefinitionName);
      }
    });
  }

  private setPagination(documentDefinitionName: string): void {
    combineLatest([this.hasStoredSearchRequest$, this.storedSearchRequestKey$, this.columns$])
      .pipe(take(1))
      .subscribe(([hasStoredSearchRequest, storedSearchRequestKey, columns]) => {
        const defaultSortState = this.dossierService.getInitialSortState(columns);
        const defaultPagination: Pagination = {
          ...this.DEFAULT_PAGINATION,
          sort: defaultSortState,
        };
        const storedSearchRequest =
          hasStoredSearchRequest && JSON.parse(localStorage.getItem(storedSearchRequestKey));
        const storedPagination: Pagination | undefined = storedSearchRequest && {
          ...this.DEFAULT_PAGINATION,
          sort: storedSearchRequest.sort,
          page: storedSearchRequest.page + 1,
          size: storedSearchRequest.size,
        };

        this.pagination$.next(storedPagination || defaultPagination);
      });
  }

  private setCollectionSize(documents: Documents): void {
    this.pagination$.pipe(take(1)).subscribe(pagination => {
      if (pagination.collectionSize !== documents.totalElements) {
        this.pagination$.next({...pagination, collectionSize: documents.totalElements});
      }
    });
  }

  pageChange(newPage: number) {
    this.pagination$.pipe(take(1)).subscribe(pagination => {
      if (pagination && pagination.page !== newPage) {
        this.logger.log(`Page change: ${newPage}`);
        this.pagination$.next({...pagination, page: newPage});
      }
    });
  }

  pageSizeChange(newPageSize: number) {
    this.pagination$.pipe(take(1)).subscribe(pagination => {
      if (pagination && pagination.size !== newPageSize) {
        const amountOfAvailablePages = Math.ceil(pagination.collectionSize / newPageSize);
        const newPage =
          amountOfAvailablePages < pagination.page ? amountOfAvailablePages : pagination.page;
        this.logger.log(`Page size change. New Page: ${newPage} New page size: ${newPageSize}`);
        this.pagination$.next({...pagination, size: newPageSize, page: newPage});
      }
    });
  }

  sortChanged(newSortState: SortState) {
    this.pagination$.pipe(take(1)).subscribe(pagination => {
      if (pagination && JSON.stringify(pagination.sort) !== JSON.stringify(newSortState)) {
        this.logger.log(`Sort state change: ${JSON.stringify(newSortState)}`);
        this.pagination$.next({...pagination, sort: newSortState});
      }
    });
  }

  private routeEvent(router: Router) {
    this.routerSubscription = router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
      }
    });
  }

  private openTranslationSubscription(columns: Array<DefinitionColumn>): void {
    this.translationSubscription = combineLatest(
      columns.map(column => this.translateService.stream(`fieldLabels.${column.translationKey}`))
    ).subscribe(labels => {
      this.fields = columns.map((column, index) => ({
        key: column.propertyName,
        label: labels[index],
        sortable: column.sortable,
        ...(column.viewType && {viewType: column.viewType}),
      }));
    });
  }

  public getData() {
    this.findDocumentDefinition(this.documentDefinitionName);

    if (this.hasCachedSearchRequest()) {
      const documentSearchRequest = this.getCachedSearch();
      this.globalSearchFilter = documentSearchRequest.globalSearchFilter;
      this.sequence = documentSearchRequest.sequence;
      this.createdBy = documentSearchRequest.createdBy;
      this.findDocuments(documentSearchRequest);
    } else {
      this.doSearch();
    }

    this.getAllAssociatedProcessDefinitions();
  }

  public doSearch() {
    const documentSearchRequest = this.buildDocumentSearchRequest();
    this.findDocuments(documentSearchRequest);
  }

  private findDocuments(documentSearchRequest: DocumentSearchRequest) {
    this.documentService.getDocuments(documentSearchRequest).subscribe(documents => {
      const paginationPageNumber = documents.number + 1;

      this.documents = documents;
      this.transformDocuments(this.documents.content);
      this.pagination.collectionSize = this.documents.totalElements;
      this.pagination.page = paginationPageNumber;
      this.pagination.size = this.documents.size;
      this.storeSearch(documentSearchRequest);
    });
  }

  public getAllAssociatedProcessDefinitions() {
    this.documentService
      .findProcessDocumentDefinitions(this.documentDefinitionName)
      .subscribe(processDocumentDefinitions => {
        this.processDocumentDefinitions = processDocumentDefinitions.filter(
          processDocumentDefinition => processDocumentDefinition.canInitializeDocument
        );
        this.processDefinitionListFields = [
          {
            key: 'processName',
            label: 'Proces',
          },
        ];
      });
  }

  public getCachedSearch(): DocumentSearchRequest {
    const json = JSON.parse(this.getCachedDocumentSearchRequest());
    const page = json.page || 0;
    const size = json.size || 10;

    const documentSearchRequest = new DocumentSearchRequestImpl(
      json.definitionName,
      page,
      size,
      json.sequence,
      json.createdBy,
      json.globalSearchFilter,
      json.sort
    );

    return documentSearchRequest;
  }

  private buildDocumentSearchRequest(): DocumentSearchRequest {
    return new DocumentSearchRequestImpl(
      this.documentDefinitionName,
      this.pagination.page - 1,
      this.pagination.size,
      this.sequence,
      this.createdBy,
      this.globalSearchFilter,
      this.pagination.sort && this.pagination.sort.isSorting
        ? this.pagination.sort
        : this.initialSortState
    );
  }

  private storeSearch(documentSearchRequest: DocumentSearchRequest) {
    localStorage.setItem(this.getCachedKey(), JSON.stringify(documentSearchRequest));
  }

  private getCachedDocumentSearchRequest(): string {
    return localStorage.getItem(this.getCachedKey()) || '';
  }

  private hasCachedSearchRequest(): boolean {
    return localStorage.getItem(this.getCachedKey()) !== null;
  }

  private getCachedKey(): string {
    return 'list-search-' + this.documentDefinitionName;
  }

  public rowClick(document: any) {
    console.log('row click');
    this.router.navigate([
      `/dossiers/${this.documentDefinitionName}/document/${document.id}/${DefaultTabs.summary}`,
    ]);
  }

  public startDossier() {
    if (this.processDocumentDefinitions.length > 1) {
      $('#startProcess').modal('show');
    } else {
      this.selectedProcessDocumentDefinition = this.processDocumentDefinitions[0];
      this.showStartProcessModal();
    }
  }

  private showStartProcessModal() {
    if (this.selectedProcessDocumentDefinition !== null) {
      this.processStart.openModal(this.selectedProcessDocumentDefinition);
      this.selectedProcessDocumentDefinition = null;
    }
  }

  public selectProcess(processDocumentDefinition: ProcessDocumentDefinition) {
    const modal = $('#startProcess');
    if (!this.modalListenerAdded) {
      modal.on('hidden.bs.modal', this.showStartProcessModal.bind(this));
      this.modalListenerAdded = true;
    }
    this.selectedProcessDocumentDefinition = processDocumentDefinition;
    modal.modal('hide');
  }

  private findDocumentDefinition(documentDefinitionName: string) {
    this.documentService.getDocumentDefinition(documentDefinitionName).subscribe(definition => {
      this.schema = definition.schema;
    });
  }

  private transformDocuments(documentsContent: Array<any>) {
    this.items = documentsContent.map(document => {
      const {content, ...others} = document;
      return {...content, ...others};
    });
  }

  private setCachedInitialSortState(): void {
    if (this.hasCachedSearchRequest()) {
      const cachedRequest = JSON.parse(this.getCachedDocumentSearchRequest());
      const cachedSort = cachedRequest?.sort;

      if (cachedSort) {
        this.initialSortState = cachedSort;
      }
    }
  }
}
