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
import {BehaviorSubject, combineLatest, Observable, Subscription, take, tap} from 'rxjs';
import {DocumentenApiConfig} from '../../models';
import {PluginManagementService} from '../../../../services';

@Component({
  selector: 'valtimo-documenten-api-configuration',
  templateUrl: './documenten-api-configuration.component.html',
  styleUrls: ['./documenten-api-configuration.component.scss'],
})
export class DocumentenApiConfigurationComponent
  implements PluginConfigurationComponent, OnInit, OnDestroy
{
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Input() prefillConfiguration$: Observable<DocumentenApiConfig>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<DocumentenApiConfig> =
    new EventEmitter<DocumentenApiConfig>();

  private saveSubscription!: Subscription;

  private readonly formValue$ = new BehaviorSubject<DocumentenApiConfig | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly pluginManagementService: PluginManagementService) {}

  ngOnInit(): void {
    this.openSaveSubscription();

    this.pluginManagementService
      .getPluginConfigurationsByCategory('documenten-api-authentication')
      .subscribe();
  }

  ngOnDestroy() {
    this.saveSubscription?.unsubscribe();
  }

  formValueChange(formValue: DocumentenApiConfig): void {
    this.formValue$.next(formValue);
    this.handleValid(formValue);
  }

  private handleValid(formValue: DocumentenApiConfig): void {
    const valid = !!(formValue.configurationTitle && formValue.url && formValue.bronorganisatie);

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
