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

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PluginConfigurationComponent} from '../../../../models';
import {BehaviorSubject, combineLatest, map, Observable, Subscription, take} from 'rxjs';
import {VerzoekConfig} from '../../models';
import {PluginManagementService, PluginTranslationService} from '../../../../services';
import {TranslateService} from '@ngx-translate/core';
import {SelectItem} from '@valtimo/user-interface';
import {VerzoekPluginService} from '../../services';
import {ProcessService} from '@valtimo/process';

@Component({
  selector: 'valtimo-verzoek-configuration',
  templateUrl: './verzoek-configuration.component.html',
  styleUrls: ['./verzoek-configuration.component.scss'],
})
export class VerzoekConfigurationComponent
  implements PluginConfigurationComponent, OnInit, OnDestroy
{
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Input() prefillConfiguration$: Observable<VerzoekConfig>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<VerzoekConfig> = new EventEmitter<VerzoekConfig>();

  readonly notificatiePluginSelectItems$: Observable<Array<SelectItem>> = combineLatest([
    this.pluginManagementService.getPluginConfigurationsByPluginDefinitionKey('notificatiesapi'),
    this.translateService.stream('key'),
  ]).pipe(
    map(([configurations]) =>
      configurations.map(configuration => ({
        id: configuration.id,
        text: `${configuration.title} - ${this.pluginTranslationService.instant(
          'title',
          configuration.pluginDefinition.key
        )}`,
      }))
    )
  );

  readonly objectManagementSelectItems$: Observable<Array<SelectItem>> = this.verzoekPluginService
    .getAllObjects()
    .pipe(
      map(objects =>
        objects.map(object => ({
          id: object.id,
          text: object.title,
        }))
      )
    );

  readonly processSelectItems$: Observable<Array<SelectItem>> = this.processService
    .getProcessDefinitions()
    .pipe(
      map(processDefinitions =>
        processDefinitions.map(processDefinition => ({
          id: processDefinition.key,
          text: processDefinition.name,
        }))
      )
    );

  private saveSubscription!: Subscription;
  private readonly formValue$ = new BehaviorSubject<VerzoekConfig | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly pluginManagementService: PluginManagementService,
    private readonly translateService: TranslateService,
    private readonly pluginTranslationService: PluginTranslationService,
    private readonly verzoekPluginService: VerzoekPluginService,
    private readonly processService: ProcessService
  ) {}

  ngOnInit(): void {
    this.openSaveSubscription();
  }

  ngOnDestroy() {
    this.saveSubscription?.unsubscribe();
  }

  formValueChange(formValue: VerzoekConfig): void {
    console.log('value change', formValue);
    this.formValue$.next(formValue);
    this.handleValid(formValue);
  }

  private handleValid(formValue: VerzoekConfig): void {
    const valid = !!(formValue.configurationTitle && formValue.url && formValue.callbackUrl);

    this.valid$.next(valid);
    this.valid.emit(valid);
  }

  private openSaveSubscription(): void {
    this.saveSubscription = this.save$?.subscribe(save => {
      combineLatest([this.formValue$, this.valid$])
        .pipe(take(1))
        .subscribe(([formValue, valid]) => {
          if (valid) {
            this.configuration.emit(formValue);
          }
        });
    });
  }
}
