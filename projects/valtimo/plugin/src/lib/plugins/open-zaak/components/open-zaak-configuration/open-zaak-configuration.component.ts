/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.See the License for the specific language governing permissions and limitations under the License.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PluginConfigurationComponent, PluginConfigurationData} from '../../../../models';
import {BehaviorSubject, combineLatest, Observable, Subscription, take} from 'rxjs';
import {openZaakPluginSpecification} from '../../open-zaak-plugin.specification';
import {OpenZaakConfig} from '../../models';

@Component({
  selector: 'valtimo-open-zaak-configuration',
  templateUrl: './open-zaak-configuration.component.html',
  styleUrls: ['./open-zaak-configuration.component.scss'],
})
export class OpenZaakConfigurationComponent
  implements PluginConfigurationComponent, OnInit, OnDestroy
{
  @Input() clear$: Observable<void>;
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() error: boolean;
  @Input() pluginId: string;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<OpenZaakConfig> = new EventEmitter<OpenZaakConfig>();

  private saveSubscription!: Subscription;

  private readonly formValue$ = new BehaviorSubject<OpenZaakConfig | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.openSaveSubscription();
  }

  ngOnDestroy() {
    this.saveSubscription?.unsubscribe();
  }

  formValueChange(formValue: OpenZaakConfig): void {
    this.formValue$.next(formValue);
    this.handleValid(formValue);
  }

  private handleValid(formValue: OpenZaakConfig): void {
    const valid = !!(
      formValue.configurationTitle &&
      formValue.url &&
      formValue.catalogusUrl &&
      formValue.rsin &&
      formValue.secret &&
      formValue.clientId
    );

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
