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
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {
  OverflowMenu,
  PaginationTranslations,
  Table,
  TableHeaderItem,
  TableItem,
  TableModel,
} from 'carbon-components-angular';
import {get as _get} from 'lodash';
import {combineLatest, map, Observable, of, startWith, Subscription} from 'rxjs';
import {
  ActionItem,
  CarbonPaginationSelection,
  CarbonPaginatorConfig,
  CarbonTableConfig,
  ColumnConfig,
  createCarbonTableConfig,
  DEFAULT_PAGINATOR_CONFIG,
  Pagination,
  SortState,
  ViewType,
} from '../../models';
import {ViewContentService} from '../view-content/view-content.service';

@Component({
  selector: 'valtimo-carbon-table',
  templateUrl: './carbon-table.component.html',
  styleUrls: ['./carbon-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CarbonTableComponent<T> implements AfterViewInit, OnDestroy {
  @HostBinding('attr.data-carbon-theme') public theme = 'g10';

  @ViewChild('actionsMenu', {static: false}) actionsMenu: TemplateRef<OverflowMenu>;

  @Input() fields: ColumnConfig[];
  @Input() tableConfig: CarbonTableConfig = createCarbonTableConfig();
  @Input() paginatorConfig: CarbonPaginatorConfig = DEFAULT_PAGINATOR_CONFIG;
  @Input() public set pagination(pagination: Pagination) {
    this.setPaginationModel(pagination);
  }
  private _hideTableHeader = false;
  @Input() public get hideTableHeader(): boolean {
    return this._hideTableHeader;
  }
  public set hideTableHeader(value: boolean) {
    this._hideTableHeader = coerceBooleanProperty(value);
  }

  private _tableData: TableItem[][];
  private _data: Array<T>;
  @Input() set data(value: Array<T>) {
    this._data = value;

    if (!this.fields || !value) {
      return;
    }

    this._tableData = this.getTableItems(value);
    this._tableModel.data = this._tableData;
  }
  public get data(): T[] {
    return this._data;
  }

  @Input() loading: boolean;

  @Output() paginationChange: EventEmitter<CarbonPaginationSelection> = new EventEmitter();
  @Output() rowClick: EventEmitter<T> = new EventEmitter();
  @Output() search: EventEmitter<string | null> = new EventEmitter();
  @Output() sortChange: EventEmitter<SortState> = new EventEmitter();

  public batchText$: Observable<{SINGLE: any; MULTIPLE: any}> = combineLatest([
    this.translateService.stream('interface.table.singleSelect'),
    this.translateService.stream('interface.table.multipleSelect'),
  ]).pipe(
    map(([SINGLE, MULTIPLE]) => ({SINGLE, MULTIPLE})),
    startWith({
      SINGLE: this.translateService.instant('interface.table.singleSelect'),
      MULTIPLE: this.translateService.instant('interface.table.multipleSelect'),
    })
  );

  public paginationTranslations$: Observable<Partial<PaginationTranslations>> = combineLatest([
    this.translateService.stream('interface.table.itemsPerPage'),
    this.translateService.stream('interface.table.ofLastPage'),
    this.translateService.stream('interface.table.ofLastPages'),
    this.translateService.stream('interface.table.totalItems'),
  ]).pipe(
    map(([ITEMS_PER_PAGE, OF_LAST_PAGES, OF_LAST_PAGE, TOTAL_ITEMS]) => ({
      ITEMS_PER_PAGE,
      OF_LAST_PAGES,
      OF_LAST_PAGE,
      TOTAL_ITEMS,
    }))
  );

  private _skeletonTableModel: TableModel = Table.skeletonModel(5, 5);
  private _tableModel: TableModel = new TableModel();
  private _subscriptions$: Subscription = new Subscription();

  public get numberOfColumns(): number | null {
    return this.fields.length + (this.tableConfig.enableSingleSelect ? 0 : 1);
  }
  public get tableModel(): TableModel {
    return this.loading ? this._skeletonTableModel : this._tableModel;
  }

  public get selectedItems(): T[] {
    return this._tableModel.data.reduce(
      (items: T[], _, index: number) =>
        this._tableModel.isRowSelected(index)
          ? [...items, this.data[this.getItemInitialIndex(index)]]
          : [...items],
      []
    );
  }

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly viewContentService: ViewContentService,
    private readonly translateService: TranslateService
  ) {}

  public ngAfterViewInit(): void {
    this._subscriptions$.add(this.getHeaderItems());

    if (!this.data) {
      return;
    }

    this._tableData = this.getTableItems(this.data);
    this._tableModel.data = this._tableData;

    this.cd.detectChanges();
  }

  public ngOnDestroy(): void {
    this._subscriptions$.unsubscribe();
  }

  public onActionItemClick(action: ActionItem, item: T) {
    action.callback(item);
  }

  public onRowClick(rowIndex: number): void {
    const itemInitialIndex: number = this.getItemInitialIndex(rowIndex);

    if (!this.data[itemInitialIndex]) {
      return;
    }

    this.rowClick.emit(this.data[itemInitialIndex]);
  }

  public onSortClick(index: number): void {
    const header: TableHeaderItem = this.tableModel.header[index];
    const sortState: SortState = {
      state: {name: this.fields[index].key, direction: 'ASC'},
      isSorting: true,
    };

    if (!header.sorted) {
      header.sorted = true;
      header.ascending = true;
      this.sortChange.emit(sortState);
      return;
    }

    if (header.ascending) {
      header.descending = true;
      this.sortChange.emit({...sortState, state: {...sortState.state, direction: 'DESC'}});
      return;
    }

    header.sorted = false;
    this.sortChange.emit({...sortState, isSorting: false});
  }

  public onSearch(searchString: string | null): void {
    this.search.emit(searchString);
  }

  public onSelectPage(pageIndex: number): void {
    this._tableModel.currentPage = pageIndex;
    this.paginationChange.emit({
      page: pageIndex,
      size: this._tableModel.pageLength,
    });
  }

  public trackByIndex(index: number): number {
    return index;
  }

  public getHeaderItems(): Subscription {
    const fields: ColumnConfig[] = this.fields;

    const translations = fields.map((field: ColumnConfig) =>
      !field.label ? of('') : this.translateService.stream(field.label)
    );

    return combineLatest(translations).subscribe((translationResults: string[]) => {
      this._tableModel.header = translationResults.map(
        (translation: string, index: number) =>
          new TableHeaderItem({
            data: translation,
            sortable: fields[index].sortable ?? true,
            className: fields[index].className ?? '',
          })
      );
    });
  }

  private getItemInitialIndex(rowIndex: number): number {
    return (this._tableModel.currentPage - 1) * this._tableModel.pageLength + rowIndex;
  }

  private getTableItems(items: T[]): TableItem[][] {
    return !items.length
      ? []
      : items.map((item: T, index: number) =>
          this.fields.map((column: ColumnConfig) => {
            switch (column.viewType) {
              case ViewType.ACTION:
                return new TableItem({
                  data: {actions: column.actions, item},
                  template: this.actionsMenu,
                });
              case ViewType.TEMPLATE:
                return new TableItem({
                  data: {item, index},
                  template: column.template,
                });
              default:
                return new TableItem({data: this.resolveObject(column, item)});
            }
          })
        );
  }

  private resolveObject(column: ColumnConfig, item: T): string {
    const definitionKey = column.key;
    const customPropString = '$.';
    const key = definitionKey.includes(customPropString)
      ? definitionKey.split(customPropString)[1]
      : definitionKey;
    const resolvedObjValue = _get(item, key, null);
    return this.viewContentService.get(resolvedObjValue, column);
  }

  private setPaginationModel(pagination: Pagination): void {
    this._tableModel.totalDataLength = pagination.collectionSize || this.data.length;
    this._tableModel.pageLength = pagination.size;
    this._tableModel.currentPage = pagination.page;
  }
}
