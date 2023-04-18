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

import {Component} from '@angular/core';
import moment from 'moment';
import {
  DossierColumnService,
  DossierListAssigneeService,
  DossierListService,
  DossierParameterService,
} from '../services';
import {DossierListPaginationService} from '../services/dossier-list-pagination.service';
import {DossierListSearchService} from '../services/dossier-list-search.service';

// eslint-disable-next-line no-var
declare var $;

moment.locale(localStorage.getItem('langKey') || '');

@Component({
  selector: 'valtimo-dossier-list-2',
  templateUrl: './dossier-list-2.component.html',
  styleUrls: ['./dossier-list-2.component.scss'],
  providers: [
    DossierListService,
    DossierColumnService,
    DossierListPaginationService,
    DossierParameterService,
    DossierListAssigneeService,
    DossierListSearchService,
  ],
})
export class DossierList2Component {
  // public visibleDossierTabs: Array<DossierListTab> | null = null;
  // readonly loading$ = new BehaviorSubject<boolean>(true);
  // readonly loadingDocumentSearchFields$ =
  //   this.dossierListSearchService.loadingDocumentSearchFields$;
  // readonly hasEnvColumnConfig$: Observable<boolean> = this.dossierListService.hasEnvColumnConfig$;
  // readonly canHaveAssignee$: Observable<boolean> = this.dossierListAssigneeService.canHaveAssignee$;
  // readonly documentDefinitionName$ = this.dossierListService.documentDefinitionName$;
  // readonly documentSearchFields$: Observable<Array<SearchField> | null> =
  //   this.dossierListSearchService.documentSearchFields$;
  // readonly schema$ = this.dossierListService.documentDefinitionName$.pipe(
  //   switchMap(documentDefinitionName =>
  //     this.documentService.getDocumentDefinition(documentDefinitionName)
  //   ),
  //   map(documentDefinition => documentDefinition?.schema)
  // );  // readonly schema$ = this.dossierListService.documentDefinitionName$.pipe(
  //   switchMap(documentDefinitionName =>
  //     this.documentService.getDocumentDefinition(documentDefinitionName)
  //   ),
  //   map(documentDefinition => documentDefinition?.schema)
  // );
  // readonly pagination$ = this.dossierListPaginationService.pagination$;
  // private readonly hasApiColumnConfig$ = new BehaviorSubject<boolean>(false);
  //
  // private readonly _cachedColumns$ = new BehaviorSubject<Array<DefinitionColumn>>(undefined);
  //
  // private readonly columns$: Observable<Array<DefinitionColumn>> =
  //   this.dossierListService.documentDefinitionName$.pipe(
  //     switchMap(documentDefinitionName =>
  //       this.dossierColumnService.getDefinitionColumns(documentDefinitionName)
  //     ),
  //     map(res => {
  //       this.hasApiColumnConfig$.next(res.hasApiConfig);
  //       return res.columns;
  //     }),
  //     tap(columns => this._cachedColumns$.next(columns))
  //   );
  //
  // readonly fields$: Observable<Array<ListField>> = combineLatest([
  //   this._cachedColumns$,
  //   this.canHaveAssignee$,
  //   this.hasEnvColumnConfig$,
  //   this.translateService.stream('key'),
  // ]).pipe(
  //   map(([columns, canHaveAssignee, hasEnvConfig]) => {
  //     console.log('get fields', columns);
  //     const filteredAssigneeColumns = this.dossierListAssigneeService.filterAssigneeColumns(
  //       columns,
  //       canHaveAssignee
  //     );
  //     const listFields = this.dossierColumnService.mapDefinitionColumnsToListFields(
  //       filteredAssigneeColumns,
  //       hasEnvConfig
  //     );
  //     return this.dossierListAssigneeService.addAssigneeListField(
  //       columns,
  //       listFields,
  //       canHaveAssignee
  //     );
  //   }),
  //   tap(() => {
  //     console.log('fire');
  //   })
  // );
  //
  // readonly assigneeFilter$ = this.dossierListAssigneeService.assigneeFilter$;
  //
  // private readonly documentSearchRequest$: Observable<AdvancedDocumentSearchRequest> =
  //   combineLatest([this.pagination$, this.dossierListService.documentDefinitionName$]).pipe(
  //     filter(([pagination]) => !!pagination),
  //     map(
  //       ([pagination, documentDefinitionName]) =>
  //         new AdvancedDocumentSearchRequestImpl(
  //           documentDefinitionName,
  //           pagination.page - 1,
  //           pagination.size,
  //           pagination.sort
  //         )
  //     )
  //   );
  //
  // private readonly searchFieldValues$ = this.dossierListSearchService.searchFieldValues$;
  // private readonly searchSwitch$ = this.dossierListSearchService.searchSwitch$;
  //
  // private readonly documentsRequest$: Observable<Documents | SpecifiedDocuments> = combineLatest([
  //   this.documentSearchRequest$,
  //   this.searchFieldValues$,
  //   this.assigneeFilter$,
  //   this.hasEnvColumnConfig$,
  //   this.hasApiColumnConfig$,
  //   this.searchSwitch$,
  // ]).pipe(
  //   distinctUntilChanged(
  //     (
  //       [
  //         prevSearchRequest,
  //         prevSearchValues,
  //         prevAssigneeFilter,
  //         prevHasEnvColumnConfig,
  //         prevHasApiColumnConfig,
  //         prevSearchSwitch,
  //       ],
  //       [
  //         currSearchRequest,
  //         currSearchValues,
  //         currAssigneeFilter,
  //         currHasEnvColumnConfig,
  //         currHasApiColumnConfig,
  //         currSearchSwitch,
  //       ]
  //     ) =>
  //       JSON.stringify({...prevSearchRequest, ...prevSearchValues}) +
  //         prevAssigneeFilter +
  //         prevSearchSwitch ===
  //       JSON.stringify({...currSearchRequest, ...currSearchValues}) +
  //         currAssigneeFilter +
  //         currSearchSwitch
  //   ),
  //   switchMap(
  //     ([
  //       documentSearchRequest,
  //       searchValues,
  //       assigneeFilter,
  //       hasEnvColumnConfig,
  //       hasApiColumnConfig,
  //     ]) => {
  //       if ((Object.keys(searchValues) || []).length > 0) {
  //         return hasEnvColumnConfig || !hasApiColumnConfig
  //           ? this.documentService.getDocumentsSearch(
  //               documentSearchRequest,
  //               'AND',
  //               assigneeFilter,
  //               this.dossierListSearchService.mapSearchValuesToFilters(searchValues)
  //             )
  //           : this.documentService.getSpecifiedDocumentsSearch(
  //               documentSearchRequest,
  //               'AND',
  //               assigneeFilter,
  //               this.dossierListSearchService.mapSearchValuesToFilters(searchValues)
  //             );
  //       } else {
  //         return hasEnvColumnConfig || !hasApiColumnConfig
  //           ? this.documentService.getDocumentsSearch(documentSearchRequest, 'AND', assigneeFilter)
  //           : this.documentService.getSpecifiedDocumentsSearch(
  //               documentSearchRequest,
  //               'AND',
  //               assigneeFilter
  //             );
  //       }
  //     }
  //   ),
  //   tap(documents => {
  //     this.dossierListPaginationService.setCollectionSize(documents);
  //     this.dossierListPaginationService.checkPage(documents);
  //   })
  // );
  //
  // readonly documentItems$ = combineLatest([
  //   this.documentsRequest$,
  //   this.hasEnvColumnConfig$,
  //   this.hasApiColumnConfig$,
  // ]).pipe(
  //   map(([documents, hasEnvColumnConfig, hasApiColumnConfig]) => {
  //     return this.dossierListService.mapDocuments(
  //       documents,
  //       hasEnvColumnConfig,
  //       hasApiColumnConfig
  //     );
  //   }),
  //   tap(() => this.loading$.next(false))
  // );
  //
  // readonly setSearchFieldValuesSubject$ =
  //   this.dossierListSearchService.setSearchFieldValuesSubject$;
  //
  // private docDefSubscription!: Subscription;
  //
  // constructor(
  //   private readonly route: ActivatedRoute,
  //   private readonly router: Router,
  //   private readonly documentService: DocumentService,
  //   private readonly translateService: TranslateService,
  //   private readonly dossierService: DossierService,
  //   private readonly logger: NGXLogger,
  //   private readonly configService: ConfigService,
  //   private readonly dossierColumnService: DossierColumnService,
  //   private readonly dossierParameterService: DossierParameterService,
  //   private readonly dossierListService: DossierListService,
  //   private readonly dossierListPaginationService: DossierListPaginationService,
  //   private readonly dossierListAssigneeService: DossierListAssigneeService,
  //   private readonly dossierListSearchService: DossierListSearchService
  // ) {
  //   this.visibleDossierTabs = this.configService.config?.visibleDossierListTabs || null;
  // }
  //
  // ngOnInit(): void {
  //   this.dossierListSearchService.setSearchFieldParameters();
  //   this.openDocDefSubscription();
  // }
  //
  // ngOnDestroy(): void {
  //   this.docDefSubscription?.unsubscribe();
  // }
  //
  // pageChange(newPage: number): void {
  //   this.dossierListPaginationService.pageChange(newPage);
  // }
  //
  // pageSizeChange(newPageSize: number): void {
  //   this.dossierListPaginationService.pageSizeChange(newPageSize);
  // }
  //
  // sortChanged(newSortState: SortState): void {
  //   console.log('sort changed', newSortState);
  //   this.dossierListPaginationService.sortChanged(newSortState);
  // }
  //
  // rowClick(document: any): void {
  //   this.dossierListService.documentDefinitionName$
  //     .pipe(take(1))
  //     .subscribe(documentDefinitionName => {
  //       this.router.navigate([
  //         `/dossiers/${documentDefinitionName}/document/${document.id}/${DefaultTabs.summary}`,
  //       ]);
  //     });
  // }
  //
  // search(searchFieldValues: SearchFieldValues): void {
  //   this.dossierListSearchService.search(searchFieldValues);
  // }
  //
  // tabChange(tab: NgbNavChangeEvent<any>): void {
  //   this.dossierListPaginationService.setPage(1);
  //   this.dossierListAssigneeService.setAssigneeFilter(tab.nextId.toUpperCase());
  // }
  //
  // private openDocDefSubscription(): void {
  //   this.docDefSubscription = combineLatest(
  //     this.dossierListService.documentDefinitionName$,
  //     this.columns$
  //   ).subscribe(([documentDefinitionName, columns]) => {
  //     console.log('columns', columns);
  //     this.dossierListAssigneeService.resetAssigneeFilter();
  //     this.dossierListPaginationService.resetPagination(documentDefinitionName, columns);
  //   });
  // }
}
