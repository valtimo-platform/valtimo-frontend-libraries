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
  ViewEncapsulation,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {CaseWidgetWithUuid} from '../../../../../../models';
import {InputModule} from 'carbon-components-angular';

@Component({
  selector: 'valtimo-field-widget',
  templateUrl: './widget-field.component.html',
  styleUrls: ['./widget-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, WidgetFieldComponent, InputModule],
})
export class WidgetFieldComponent {
  @HostBinding('class') public readonly class = 'field-widget';
  @Input() public set widgetConfiguration(value: CaseWidgetWithUuid) {
    if (!value) return;
    this.widgetConfiguration$.next(value);
  }

  @Input() public set widgetData(value: object) {
    if (!value) return;
    this.widgetData$.next(value);
  }

  public readonly widgetConfiguration$ = new BehaviorSubject<CaseWidgetWithUuid | null>(null);
  public readonly widgetData$ = new BehaviorSubject<object | null>(null);

  public readonly widgetPropertyValue$: Observable<{title: string; value: string}[]> =
    combineLatest([this.widgetConfiguration$, this.widgetData$]).pipe(
      map(([widget, widgetData]) =>
        widget.properties.columns.map(column =>
          column.map(property => {
            if (widgetData?.hasOwnProperty(property.key)) {
              return {
                title: property.title,
                value: widgetData[property.key] || '-',
              };
            }
          })
        )
      )
    );
}
