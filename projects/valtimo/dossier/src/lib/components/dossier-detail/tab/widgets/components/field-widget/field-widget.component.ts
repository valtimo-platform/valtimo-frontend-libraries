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

import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {CaseWidgetWithUuid} from '../../../../../../models';
import {InputModule} from 'carbon-components-angular';

@Component({
  selector: 'valtimo-field-widget',
  templateUrl: './field-widget.component.html',
  styleUrls: ['./field-widget.component.scss'],
  standalone: true,
  imports: [CommonModule, FieldWidgetComponent, InputModule],
})
export class FieldWidgetComponent {
  public readonly widgetConfiguration$ = new BehaviorSubject<CaseWidgetWithUuid | null>(null);
  public readonly widgetData$ = new BehaviorSubject<object | null>(null);

  @Input() public set widgetConfiguration(value: CaseWidgetWithUuid) {
    if (!value) return;
    this.widgetConfiguration$.next(value);
  }

  @Input() public set widgetData(value: object) {
    if (!value) return;
    this.widgetData$.next(value);
  }

  public readonly widgetPropertyValue$: Observable<any> = combineLatest([
    this.widgetConfiguration$,
    this.widgetData$,
  ]).pipe(
    map(([widget, widgetData]) => {
      return widget.properties.columns.map(column => {
        return column.map(property => {
          if (widgetData?.hasOwnProperty(property.key)) {
            return {
              title: property.title,
              value: widgetData[property.key] || '-',
            };
          }
        });
      });
    })
  );

  constructor() {}
}
