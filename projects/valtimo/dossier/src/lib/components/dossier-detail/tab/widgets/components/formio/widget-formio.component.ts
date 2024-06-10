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

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormioCaseWidgetWidgetWithUuid} from '../../../../../../models';
import {BehaviorSubject, combineLatest, filter, Observable, switchMap} from 'rxjs';
import {FormService} from '@valtimo/form';

@Component({
  selector: 'valtimo-widget-formio',
  templateUrl: './widget-formio.component.html',
  styleUrls: ['./widget-formio.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetFormioComponent {
  @Input() public set documentId(value: string) {
    if (value) this._documentId$.next(value);
  }
  @Input() public set widgetConfiguration(value: FormioCaseWidgetWidgetWithUuid) {
    if (value) this._widgetConfigurationSubject$.next(value);
  }

  private readonly _widgetConfigurationSubject$ =
    new BehaviorSubject<FormioCaseWidgetWidgetWithUuid | null>(null);
  private get widgetConfiguration$(): Observable<FormioCaseWidgetWidgetWithUuid> {
    return this._widgetConfigurationSubject$.pipe(filter(config => !!config));
  }

  private readonly _documentId$ = new BehaviorSubject<string>('');
  private get documentId$(): Observable<string> {
    return this._documentId$.pipe(filter(id => !!id));
  }

  public readonly prefilledFormDefinition$ = combineLatest([
    this.widgetConfiguration$,
    this.documentId$,
  ]).pipe(
    switchMap(([config, documentId]) =>
      this.formService.getFormDefinitionByNamePreFilled(
        config.properties.formDefinition,
        documentId
      )
    )
  );

  constructor(private readonly formService: FormService) {}
}
