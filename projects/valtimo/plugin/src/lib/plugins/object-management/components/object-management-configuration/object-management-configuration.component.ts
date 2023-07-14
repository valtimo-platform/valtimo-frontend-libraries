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

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PluginConfigurationComponent} from '../../../../models';
import {BehaviorSubject, combineLatest, Observable, Subscription, take} from 'rxjs';
import {ObjectManagementConfig} from '../../models';

@Component({
  selector: 'valtimo-object-management-configuration',
  templateUrl: './object-management-configuration.component.html',
  styleUrls: ['./object-management-configuration.component.scss'],
})
export class ObjectManagementConfigurationComponent
  implements PluginConfigurationComponent, OnInit, OnDestroy
{
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Input() prefillConfiguration$: Observable<ObjectManagementConfig>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<ObjectManagementConfig> =
    new EventEmitter<ObjectManagementConfig>();

  private saveSubscription!: Subscription;

  private readonly formValue$ = new BehaviorSubject<ObjectManagementConfig | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  ngOnInit(): void {
    this.openSaveSubscription();
    this.formValue$.next({configurationTitle: 'Object Management'});
    this.valid$.next(true);
    this.valid.emit(true);
  }

  ngOnDestroy() {
    this.saveSubscription?.unsubscribe();
  }

  formValueChange(formValue: ObjectManagementConfig): void {
    this.formValue$.next(formValue);
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
