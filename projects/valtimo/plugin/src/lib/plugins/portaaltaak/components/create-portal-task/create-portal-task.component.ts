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
import {FunctionConfigurationComponent} from '../../../../models';
import {BehaviorSubject, combineLatest, map, Observable, Subscription, take} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {PluginTranslationService} from '../../../../services';
import {CreatePortalTaskConfig, FormType} from '../../models';

@Component({
  selector: 'valtimo-create-portal-task',
  templateUrl: './create-portal-task.component.html',
  styleUrls: ['./create-portal-task.component.scss'],
})
export class CreatePortalTaskComponent
  implements FunctionConfigurationComponent, OnInit, OnDestroy
{
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Input() prefillConfiguration$: Observable<CreatePortalTaskConfig>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<CreatePortalTaskConfig> =
    new EventEmitter<CreatePortalTaskConfig>();
  readonly FORM_TYPE_ITEMS: Array<FormType> = ['definition', 'url'];
  readonly formTypeSelectItems$: Observable<Array<{id: FormType; text: string}>> =
    this.translateService.stream('key').pipe(
      map(() =>
        this.FORM_TYPE_ITEMS.map(item => ({
          id: item,
          text: this.pluginTranslationService.instant(item, this.pluginId),
        }))
      )
    );

  private saveSubscription!: Subscription;
  private readonly formValue$ = new BehaviorSubject<CreatePortalTaskConfig | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly translateService: TranslateService,
    private readonly pluginTranslationService: PluginTranslationService
  ) {}

  ngOnInit(): void {
    this.openSaveSubscription();
  }

  ngOnDestroy(): void {
    this.saveSubscription?.unsubscribe();
  }

  formValueChange(formValue: CreatePortalTaskConfig): void {
    this.formValue$.next(formValue);
    this.handleValid(formValue);
  }

  private handleValid(formValue: CreatePortalTaskConfig): void {
    const valid = !!formValue.formType;

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
