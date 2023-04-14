/*
 * Copyright 2015-2023 Ritense BV, the Netherlands.
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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {
  AssigneeFilter,
  ConfigService,
  DefinitionColumn,
  DossierListTab,
  SearchField,
  SearchFieldValues,
  SearchFilter,
  SearchFilterRange,
} from '@valtimo/config';
import {
  AdvancedDocumentSearchRequest,
  AdvancedDocumentSearchRequestImpl,
  Documents,
  DocumentService,
  SortState,
  SpecifiedDocuments,
} from '@valtimo/document';
import moment from 'moment';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  first,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {DefaultTabs} from '../dossier-detail-tab-enum';
import {DossierService} from '../dossier.service';
import {ListField} from '@valtimo/components';
import {NGXLogger} from 'ngx-logger';
import {NgbNavChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import {DossierColumnService, DossierListService, DossierParameterService} from '../services';
import {DossierListPaginationService} from '../services/dossier-list-pagination.service';

// eslint-disable-next-line no-var
declare var $;

moment.locale(localStorage.getItem('langKey') || '');

@Component({
  selector: 'valtimo-dossier-list',
  templateUrl: './dossier-list.component.html',
  styleUrls: ['./dossier-list.component.css'],
  providers: [
    DossierListService,
    DossierColumnService,
    DossierListPaginationService,
    DossierParameterService,
  ],
})
export class DossierListComponent implements OnInit, OnDestroy {
  public dossierVisibleTabs: Array<DossierListTab> | null = null;

  private readonly defaultAssigneeFilter = 'ALL';

  readonly loading$ = new BehaviorSubject<boolean>(true);

  readonly loadingDocumentSearchFields$ = new BehaviorSubject<boolean>(true);

  readonly hasEnvColumnConfig$: Observable<boolean> = this.dossierListService.hasEnvColumnConfig$;
  readonly canHaveAssignee$: Observable<boolean> = this.dossierListService.canHaveAssignee$;

  readonly documentDefinitionName$ = this.dossierListService.documentDefinitionName$;

  readonly documentSearchFields$: Observable<Array<SearchField> | null> =
    this.dossierListService.documentDefinitionName$.pipe(
      tap(() => this.loadingDocumentSearchFields$.next(true)),
      switchMap(documentDefinitionName =>
        this.documentService.getDocumentSearchFields(documentDefinitionName)
      ),
      tap(() => this.loadingDocumentSearchFields$.next(false))
    );

  readonly schema$ = this.dossierListService.documentDefinitionName$.pipe(
    switchMap(documentDefinitionName =>
      this.documentService.getDocumentDefinition(documentDefinitionName)
    ),
    map(documentDefinition => documentDefinition?.schema),
    tap(() => {
      this.assigneeFilter$.next(this.defaultAssigneeFilter);
    })
  );

  readonly pagination$ = this.dossierListPaginationService.pagination$;

  private readonly storedSearchRequestKey$: Observable<string> =
    this.dossierListService.documentDefinitionName$.pipe(
      map(documentDefinitionName => `list-search-${documentDefinitionName}`)
    );

  private readonly hasStoredSearchRequest$: Observable<boolean> = this.storedSearchRequestKey$.pipe(
    map(storedSearchRequestKey => localStorage.getItem(storedSearchRequestKey) !== null)
  );

  private readonly hasApiColumnConfig$ = new BehaviorSubject<boolean>(false);

  private readonly columns$: Observable<Array<DefinitionColumn>> =
    this.dossierListService.documentDefinitionName$.pipe(
      switchMap(documentDefinitionName =>
        this.dossierColumnService.getDefinitionColumns(documentDefinitionName)
      ),
      map(res => {
        this.hasApiColumnConfig$.next(res.hasApiConfig);
        return res.columns;
      }),
      tap(columns => console.log('columns', columns))
    );

  private readonly ASSIGNEE_KEY = 'assigneeFullName';

  readonly fields$: Observable<Array<ListField>> = combineLatest([
    this.columns$,
    this.canHaveAssignee$,
    this.hasEnvColumnConfig$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([columns, canHaveAssignee, hasEnvConfig]) => [
      ...columns
        .map(column => {
          const translationKey = `fieldLabels.${column.translationKey}`;
          const translation = this.translateService.instant(translationKey);
          const validTranslation = translation !== translationKey && translation;
          return {
            key: hasEnvConfig ? column.propertyName : column.translationKey,
            label: column.title || validTranslation || column.translationKey,
            sortable: column.sortable,
            ...(column.viewType && {viewType: column.viewType}),
            ...(column.enum && {enum: column.enum}),
            ...(column.format && {format: column.format}),
          };
        })
        // Filter out assignee column if the case type can not have an assignee
        .filter(column => {
          if (column?.key === this.ASSIGNEE_KEY && !canHaveAssignee) {
            return false;
          }
          return true;
        }),
      // If the case type can have an assignee, and the assignee column is not present in the case column definition, add an assignee column at the end
      ...(canHaveAssignee && !columns.find(column => column.propertyName === this.ASSIGNEE_KEY)
        ? [
            {
              key: this.ASSIGNEE_KEY,
              label: this.translateService.instant(`fieldLabels.${this.ASSIGNEE_KEY}`),
              sortable: true,
              viewType: 'string',
            },
          ]
        : []),
    ])
  );

  private readonly documentSearchRequest$: Observable<AdvancedDocumentSearchRequest> =
    combineLatest([this.pagination$, this.dossierListService.documentDefinitionName$]).pipe(
      filter(([pagination]) => !!pagination),
      map(
        ([pagination, documentDefinitionName]) =>
          new AdvancedDocumentSearchRequestImpl(
            documentDefinitionName,
            pagination.page - 1,
            pagination.size,
            pagination.sort
          )
      )
    );

  private readonly searchFieldValues$ = new BehaviorSubject<SearchFieldValues>({});
  private readonly assigneeFilter$ = new BehaviorSubject<AssigneeFilter>(
    this.defaultAssigneeFilter
  );
  private readonly searchSwitch$ = new BehaviorSubject<boolean>(false);

  private readonly documentsRequest$: Observable<Documents | SpecifiedDocuments> = combineLatest([
    this.documentSearchRequest$,
    this.searchFieldValues$,
    this.assigneeFilter$,
    this.hasEnvColumnConfig$,
    this.hasApiColumnConfig$,
    this.searchSwitch$,
  ]).pipe(
    distinctUntilChanged(
      (
        [
          prevSearchRequest,
          prevSearchValues,
          prevAssigneeFilter,
          prevHasEnvColumnConfig,
          prevHasApiColumnConfig,
          prevSearchSwitch,
        ],
        [
          currSearchRequest,
          currSearchValues,
          currAssigneeFilter,
          currHasEnvColumnConfig,
          currHasApiColumnConfig,
          currSearchSwitch,
        ]
      ) =>
        JSON.stringify({...prevSearchRequest, ...prevSearchValues}) +
          prevAssigneeFilter +
          prevSearchSwitch ===
        JSON.stringify({...currSearchRequest, ...currSearchValues}) +
          currAssigneeFilter +
          currSearchSwitch
    ),
    tap(([documentSearchRequest]) => {
      this.storedSearchRequestKey$.pipe(take(1)).subscribe(storedSearchRequestKey => {
        this.logger.debug(
          `store request in local storage: ${JSON.stringify(documentSearchRequest)}`
        );
        localStorage.setItem(storedSearchRequestKey, JSON.stringify(documentSearchRequest));
      });
    }),
    switchMap(
      ([
        documentSearchRequest,
        searchValues,
        assigneeFilter,
        hasEnvColumnConfig,
        hasApiColumnConfig,
      ]) => {
        if ((Object.keys(searchValues) || []).length > 0) {
          return hasEnvColumnConfig || !hasApiColumnConfig
            ? this.documentService.getDocumentsSearch(
                documentSearchRequest,
                'AND',
                assigneeFilter,
                this.mapSearchValuesToFilters(searchValues)
              )
            : this.documentService.getSpecifiedDocumentsSearch(
                documentSearchRequest,
                'AND',
                assigneeFilter,
                this.mapSearchValuesToFilters(searchValues)
              );
        } else {
          return hasEnvColumnConfig || !hasApiColumnConfig
            ? this.documentService.getDocumentsSearch(documentSearchRequest, 'AND', assigneeFilter)
            : this.documentService.getSpecifiedDocumentsSearch(
                documentSearchRequest,
                'AND',
                assigneeFilter
              );
        }
      }
    ),
    tap(documents => {
      this.dossierListPaginationService.setCollectionSize(documents);
      this.dossierListPaginationService.checkPage(documents);
    })
  );

  readonly documentItems$ = combineLatest([
    this.documentsRequest$,
    this.hasEnvColumnConfig$,
    this.hasApiColumnConfig$,
  ]).pipe(
    map(([documents, hasEnvColumnConfig, hasApiColumnConfig]) => {
      if (hasEnvColumnConfig || !hasApiColumnConfig) {
        const docsToMap = documents as Documents;
        return documents.content.map(document => {
          const {content, ...others} = document;
          return {...content, ...others};
        });
      } else {
        const docsToMap = documents as SpecifiedDocuments;
        return docsToMap.content.reduce((acc, curr) => {
          const propsObject = {id: curr.id};
          curr.items.forEach(item => {
            propsObject[item.key] = item.value;
          });
          return [...acc, propsObject];
        }, []);
      }
    }),
    tap(() => this.loading$.next(false))
  );

  readonly setSearchFieldValuesSubject$ = new Subject<SearchFieldValues>();

  private docDefSubscription!: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly documentService: DocumentService,
    private readonly translateService: TranslateService,
    private readonly dossierService: DossierService,
    private readonly logger: NGXLogger,
    private readonly configService: ConfigService,
    private readonly dossierColumnService: DossierColumnService,
    private readonly dossierParameterService: DossierParameterService,
    private readonly dossierListService: DossierListService,
    private readonly dossierListPaginationService: DossierListPaginationService
  ) {
    this.dossierVisibleTabs = this.configService.config?.visibleDossierListTabs || null;
  }

  ngOnInit(): void {
    this.setSearchFieldParametersInComponent();
    this.openDocDefSubscription();
  }

  ngOnDestroy(): void {
    this.docDefSubscription?.unsubscribe();
  }

  pageChange(newPage: number): void {
    this.dossierListPaginationService.pageChange(newPage);
  }

  pageSizeChange(newPageSize: number): void {
    this.dossierListPaginationService.pageSizeChange(newPageSize);
  }

  sortChanged(newSortState: SortState): void {
    this.dossierListPaginationService.sortChanged(newSortState);
  }

  rowClick(document: any): void {
    this.dossierListService.documentDefinitionName$
      .pipe(take(1))
      .subscribe(documentDefinitionName => {
        this.router.navigate([
          `/dossiers/${documentDefinitionName}/document/${document.id}/${DefaultTabs.summary}`,
        ]);
      });
  }

  search(searchFieldValues: SearchFieldValues): void {
    this.searchFieldValues$.next(searchFieldValues || {});
    this.dossierParameterService.setSearchParameters(searchFieldValues);
    this.searchSwitch$
      .pipe(
        first(),
        tap(switchValue => this.searchSwitch$.next(!switchValue))
      )
      .subscribe();
  }

  tabChange(tab: NgbNavChangeEvent<any>): void {
    this.dossierListPaginationService.setPage(1);
    this.assigneeFilter$.next(tab.nextId.toUpperCase());
  }

  private mapSearchValuesToFilters(
    values: SearchFieldValues
  ): Array<SearchFilter | SearchFilterRange> {
    const filters: Array<SearchFilter | SearchFilterRange> = [];

    Object.keys(values).forEach(valueKey => {
      const searchValue = values[valueKey] as any;
      if (searchValue.start) {
        filters.push({key: valueKey, rangeFrom: searchValue.start, rangeTo: searchValue.end});
      } else if (Array.isArray(searchValue)) {
        filters.push({key: valueKey, values: searchValue});
      } else {
        filters.push({key: valueKey, values: [searchValue]});
      }
    });

    return filters;
  }

  private setSearchFieldParametersInComponent(): void {
    this.dossierParameterService.querySearchParams$.pipe(take(1)).subscribe(values => {
      if (Object.keys(values || {}).length > 0) {
        setTimeout(() => {
          this.setSearchFieldValuesSubject$.next(values);
        });
      }
    });
  }

  private openDocDefSubscription(): void {
    this.docDefSubscription = this.dossierListService.documentDefinitionName$
      .pipe(
        tap(docDef => console.log('doc def change', docDef)),
        switchMap(docDefName =>
          combineLatest([
            this.columns$,
            this.hasStoredSearchRequest$,
            this.storedSearchRequestKey$,
            of(docDefName),
          ])
        ),
        tap(([columns, hasStoredSearchRequest, storedSearchRequestKey, docDefName]) => {
          console.log('reset page');
          this.dossierListPaginationService.resetPagination(
            docDefName,
            columns,
            hasStoredSearchRequest,
            storedSearchRequestKey
          );
        })
      )
      .subscribe();
  }
}
