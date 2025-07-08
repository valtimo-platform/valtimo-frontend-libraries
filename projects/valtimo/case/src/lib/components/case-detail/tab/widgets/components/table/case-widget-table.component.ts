/*
 * Copyright 2015-2025 Ritense BV, the Netherlands.
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
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {CarbonListItem, CarbonListModule} from '@valtimo/components';
import {Page} from '@valtimo/shared';
import {
  ButtonModule,
  PaginationModel,
  PaginationModule,
  TilesModule,
} from 'carbon-components-angular';
import {BehaviorSubject, combineLatest, filter, map, Observable, of, switchMap} from 'rxjs';
import {CaseWidgetsApiService} from '../../../../../../services';
import {WidgetProcess} from '../widget-process/widget-process';
import {DocumentService} from '@valtimo/document';
import {PermissionService} from '@valtimo/access-control';
import {WidgetsService} from '../../widgets.service';
import {TableWidget, WidgetAction, WidgetTableComponent} from '@valtimo/layout';

@Component({
  selector: 'valtimo-case-widget-table',
  templateUrl: './case-widget-table.component.html',
  styleUrls: ['./case-widget-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    CarbonListModule,
    PaginationModule,
    TilesModule,
    TranslateModule,
    ButtonModule,
    WidgetTableComponent,
  ],
})
export class CaseWidgetTableComponent extends WidgetProcess {
  @Input({required: true}) public set documentId(value: string) {
    this.baseDocumentId = value;
  }
  @Input({required: true}) public tabKey: string;

  private _widgetConfiguration: TableWidget;
  @Input({required: true}) public set widgetConfiguration(value: TableWidget) {
    this._widgetConfiguration = value;
    this.baseWidgetConfiguration = value;
  }
  public get widgetConfiguration(): TableWidget {
    return this._widgetConfiguration;
  }

  private readonly _initialNumberOfElementsSubject$ = new BehaviorSubject<number>(null);

  private get _initialNumberOfElements$(): Observable<number> {
    return this._initialNumberOfElementsSubject$.pipe(
      filter(numberOfElements => numberOfElements !== null)
    );
  }

  private _widgetData$ = new BehaviorSubject<Page<CarbonListItem> | null>(null);
  @Input({required: true}) set widgetData(value: Page<CarbonListItem> | null) {
    if (!value) return;

    this._initialNumberOfElementsSubject$.next(value.numberOfElements);
    this._widgetData$.next(value);
  }

  private readonly _queryParams$ = new BehaviorSubject<string | null>(null);

  public readonly widgetData$: Observable<Page<CarbonListItem>> = combineLatest([
    this._widgetData$,
    this._queryParams$,
    this._initialNumberOfElements$,
  ]).pipe(
    switchMap(([data, queryParams, initialNumberOfElements]) =>
      combineLatest([
        !queryParams
          ? of(data as Page<CarbonListItem>)
          : this.caseWidgetsApiService.getWidgetData(
              this.baseDocumentId,
              this.tabKey,
              this.widgetConfiguration.key,
              queryParams
            ),
        of(initialNumberOfElements),
      ])
    ),
    filter(([page]) => !!page),
    map(([page, initialNumberOfElements]) => {
      if (page.content.length === initialNumberOfElements) {
        return page;
      }

      const rows = new Array<number>(initialNumberOfElements).fill(null);

      return {...page, content: rows.map((_, index) => page.content[index] || {})};
    })
  );

  constructor(
    protected readonly documentService: DocumentService,
    protected readonly permissionService: PermissionService,
    private readonly caseWidgetsApiService: CaseWidgetsApiService,
    private readonly widgetsService: WidgetsService
  ) {
    super(documentService, permissionService);
  }

  public onPaginationEvent(event: PaginationModel): void {
    this._queryParams$.next(`page=${event.currentPage - 1}&size=${event.pageLength}`);
  }

  public onProcessStartClick(process: WidgetAction): void {
    this.widgetsService.startProcess(process.processDefinitionKey);
  }
}
