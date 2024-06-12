/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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

import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  InputModule,
  PaginationModel,
  PaginationModule,
  TilesModule,
} from 'carbon-components-angular';
import {FieldsCaseWidget} from '../../../../../../models';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {CarbonListModule, ViewContentService} from '@valtimo/components';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'valtimo-widget-collection',
  templateUrl: './widget-collection.component.html',
  styleUrls: ['./widget-collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    InputModule,
    PaginationModule,
    TilesModule,
    WidgetCollectionComponent,
    CarbonListModule,
    TranslateModule,
  ],
})
export class WidgetCollectionComponent {
  @HostBinding('class') public readonly class = 'widget-collection';
  @Input() public set widgetConfiguration(value: FieldsCaseWidget) {
    if (!value) return;
    this.widgetConfiguration$.next(value);
  }

  @Input() public set widgetData(value: object) {
    if (!value) return;
    this.widgetData$.next(value);
  }

  public readonly widgetConfiguration$ = new BehaviorSubject<FieldsCaseWidget | null>(null);
  public readonly widgetData$ = new BehaviorSubject<object | null>(null);
  private readonly _queryParams$ = new BehaviorSubject<string | null>(null);
  public readonly paginationModel = signal<PaginationModel>(new PaginationModel());
  public readonly widgetPropertyValue$: Observable<{title: string; value: string}[][]> =
    combineLatest([this.widgetConfiguration$, this.widgetData$]).pipe(
      map(([widget, widgetData]) =>
        widget?.properties.fields.map(field =>
          field.reduce(
            (fields, property) => [
              ...fields,
              ...(widgetData?.hasOwnProperty(property.key)
                ? [
                    {
                      title: property.title,
                      value: !!widgetData[property.key]
                        ? this.viewContentService.get(widgetData[property.key], {
                            ...property.displayProperties,
                            viewType: property.displayProperties?.type,
                          })
                        : '-',
                    },
                  ]
                : []),
            ],
            []
          )
        )
      )
    );

  constructor(private viewContentService: ViewContentService) {}

  public onSelectPage(page: number): void {
    this._queryParams$.next(`page=${page - 1}&size=${this.paginationModel().pageLength}`);
    this.paginationModel.update((model: PaginationModel) => ({
      ...model,
      currentPage: page,
    }));
  }
}
