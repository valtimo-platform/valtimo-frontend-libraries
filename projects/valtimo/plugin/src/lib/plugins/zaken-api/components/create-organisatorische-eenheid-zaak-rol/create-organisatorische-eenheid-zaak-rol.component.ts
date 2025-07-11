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

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FunctionConfigurationComponent} from '../../../../models';
import {BehaviorSubject, combineLatest, Observable, Subscription, take} from 'rxjs';
import {CreateOrganisatorischeEenheidZaakRolConfig} from '../../models';
import {RadioValue} from '@valtimo/components';

@Component({
  standalone: false,
  selector: 'valtimo-create-organisatorische-eenheid-zaak-rol-configuration',
  templateUrl: './create-organisatorische-eenheid-zaak-rol.component.html'
})
export class CreateOrganisatorischeEenheidZaakRolComponent implements FunctionConfigurationComponent, OnInit, OnDestroy {
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Input() prefillConfiguration$: Observable<CreateOrganisatorischeEenheidZaakRolConfig>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<CreateOrganisatorischeEenheidZaakRolConfig> =
    new EventEmitter<CreateOrganisatorischeEenheidZaakRolConfig>();

  private saveSubscription!: Subscription;

  private readonly formValue$ = new BehaviorSubject<CreateOrganisatorischeEenheidZaakRolConfig | null>(
    null
  );
  private readonly valid$ = new BehaviorSubject<boolean>(false);

  readonly indicatieMachtigingValues: Array<RadioValue> = [{
    value: '',
    title: 'N.v.t',
    titleTranslationKey: 'nvt'
  }, {
    value: 'gemachtigde',
    title: 'Gemachtigde',
    titleTranslationKey: 'gemachtigde'
  }, {
    value: 'machtiginggever',
    title: 'Machtiginggever',
    titleTranslationKey: 'machtiginggever'
  }]

  ngOnInit(): void {
    this.openSaveSubscription();
  }

  ngOnDestroy() {
    this.saveSubscription?.unsubscribe();
  }

  formValueChange(formValue: CreateOrganisatorischeEenheidZaakRolConfig): void {
    this.formValue$.next(formValue);
    this.handleValid(formValue);
  }

  private handleValid(formValue: CreateOrganisatorischeEenheidZaakRolConfig): void {
    const valid = !!(
      formValue.rolToelichting &&
      formValue.roltypeUrl &&
      formValue.identificatie &&
      formValue.naam &&
      formValue.isGehuisvestIn
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
