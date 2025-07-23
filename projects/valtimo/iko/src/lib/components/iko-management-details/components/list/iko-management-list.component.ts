/*
 * Copyright 2015-2025 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * You may not use this file except in compliance with the License.
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
import {CommonModule} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  Observable,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {map} from 'rxjs/operators';
import {CarbonListModule, ColumnConfig} from '@valtimo/components';
import {IkoManagementApiService} from '../../../../services';
import {TabsModule} from 'carbon-components-angular';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {getDisplayTypeParametersView} from '@valtimo/shared';
import {ListColumnDto} from '../../../../models';

@Component({
  standalone: true,
  selector: 'valtimo-iko-management-list-columns',
  templateUrl: './iko-management-list.component.html',
  styleUrls: ['./iko-management-list.component.scss'],
  imports: [CommonModule, CarbonListModule, TabsModule, TranslateModule],
})
export class IkoManagementListComponent implements OnInit, OnDestroy {
  public readonly loading$ = new BehaviorSubject<boolean>(true);

  public readonly disableInput$ = new BehaviorSubject<boolean>(true);

  private readonly _dataAggregateKey$: Observable<string> = this.route.params.pipe(
    map(params => params?.key),
    filter(key => !!key)
  );

  private readonly _ikoListColumns$ = new BehaviorSubject<ListColumnDto[]>([]);

  private readonly _reloadColumns$ = new BehaviorSubject<null>(null);

  public readonly ikoListColumns$ = combineLatest([
    this._ikoListColumns$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([columns]) =>
      columns.map(column => ({
        ...column,
        title: column.title || '-',
        sortable: column.sortable
          ? this.translateService.instant('listColumn.sortableYes')
          : this.translateService.instant('listColumn.sortableNo'),
        defaultSort:
          (column.defaultSort === 'ASC' &&
            this.translateService.instant('listColumn.sortableAsc')) ||
          (column.defaultSort === 'DESC' &&
            this.translateService.instant('listColumn.sortableDesc')) ||
          '-',
        displayType: this.translateService.instant(
          `listColumnDisplayType.${column?.displayType?.type}`
        ),
        displayTypeParameters: getDisplayTypeParametersView(
          column.displayType.displayTypeParameters
        ),
      }))
    ),
    tap(() => this.disableInput$.next(false))
  );

  public readonly FIELDS: Array<ColumnConfig> = [
    {
      key: 'title',
      label: 'listColumn.title',
      viewType: 'string',
      sortable: false,
    },
    {
      key: 'key',
      label: 'listColumn.key',
      viewType: 'string',
      sortable: false,
    },
    {
      key: 'path',
      label: 'listColumn.path',
      viewType: 'string',
      sortable: false,
    },
    {
      key: 'displayType',
      label: 'listColumn.displayType',
      viewType: 'string',
      sortable: false,
    },
    {
      key: 'displayTypeParameters',
      label: 'listColumn.displayTypeParameters',
      viewType: 'string',
      sortable: false,
    },
    {
      key: 'sortable',
      label: 'listColumn.sortable',
      viewType: 'string',
      sortable: false,
    },
    {
      key: 'defaultSort',
      label: 'listColumn.defaultSort',
      viewType: 'string',
      sortable: false,
    },
  ];

  private readonly _subscriptions = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ikoManagementApiService: IkoManagementApiService,
    private readonly translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this._subscriptions.add(
      combineLatest([this._dataAggregateKey$, this._reloadColumns$])
        .pipe(
          tap(() => this.disableInput$.next(true)),
          switchMap(([key]) => this.ikoManagementApiService.getIkoListColumns(key)),
          tap(res => {
            this._ikoListColumns$.next(res);
            this.loading$.next(false);
          })
        )
        .subscribe()
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public onItemsReordered(items: {id: string}[]): void {
    const listColumns = this._ikoListColumns$.getValue();
    const mappedItems = items
      .map(item => listColumns.find(column => column.id === item.id))
      .map((item, index) => ({...item, order: index}));

    this.disableInput();

    this._dataAggregateKey$
      .pipe(switchMap(key => this.ikoManagementApiService.updateIkoListColumns(key, mappedItems)))
      .subscribe({
        next: () => {
          this.enableInput();
          this.reloadColumns();
        },
        error: () => {
          this.enableInput();
        },
      });
  }

  private disableInput(): void {
    this.disableInput$.next(true);
  }

  private enableInput(): void {
    this.disableInput$.next(false);
  }

  private reloadColumns(): void {
    this._reloadColumns$.next(null);
  }
}
