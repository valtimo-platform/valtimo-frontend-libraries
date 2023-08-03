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

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {ConfigurationOutput, DisplayTypeConfigurationComponent} from '../../../../models';
import {Subscription} from 'rxjs';
import {FormBuilder, Validators} from '@angular/forms';
import {BigNumberDisplayTypeProperties} from '../../models';

@Component({
  templateUrl: './big-number-configuration.component.html',
  styleUrls: ['./big-number-configuration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BigNumberConfigurationComponent
  implements OnInit, OnDestroy, DisplayTypeConfigurationComponent
{
  public readonly form = this.fb.group({
    title: this.fb.control('', [Validators.required]),
    subtitle: this.fb.control(''),
    label: this.fb.control(''),
    useKPI: this.fb.control(false, [Validators.required]),
    lowSeverityThreshold: this.fb.control(null),
    mediumSeverityThreshold: this.fb.control(null),
    highSeverityThreshold: this.fb.control(null),
  });

  @Input() displayTypeKey: string;
  @Input() set disabled(disabledValue: boolean) {
    if (disabledValue) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  public get title() {
    return this.form.get('title');
  }

  public get subtitle() {
    return this.form.get('subtitle');
  }

  public get label() {
    return this.form.get('label');
  }

  public get useKPI() {
    return this.form.get('useKPI');
  }

  public get lowSeverityThreshold() {
    return this.form.get('lowSeverityThreshold');
  }

  public get mediumSeverityThreshold() {
    return this.form.get('mediumSeverityThreshold');
  }

  public get highSeverityThreshold() {
    return this.form.get('highSeverityThreshold');
  }

  @Input() set prefillConfiguration(configurationValue: BigNumberDisplayTypeProperties) {
    if (configurationValue) {
      this.title.setValue(configurationValue.title || '');
      this.subtitle.setValue(configurationValue.subtitle || '');
      this.label.setValue(configurationValue.label || '');
      this.useKPI.setValue(configurationValue.useKPI || false);
      this.lowSeverityThreshold.setValue(configurationValue.lowSeverityThreshold || null);
      this.mediumSeverityThreshold.setValue(configurationValue.mediumSeverityThreshold || null);
      this.highSeverityThreshold.setValue(configurationValue.highSeverityThreshold || null);
    }
  }

  @Output() configuration: EventEmitter<ConfigurationOutput> =
    new EventEmitter<ConfigurationOutput>();

  private _subscriptions = new Subscription();

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.openFormSubscription();
    this.openKPISubscription();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private openFormSubscription(): void {
    this._subscriptions.add(
      this.form.valueChanges.subscribe(formValue => {
        this.configuration.emit({valid: this.form.valid, data: formValue});
      })
    );
  }

  private openKPISubscription(): void {
    this._subscriptions.add(
      this.useKPI.valueChanges.subscribe(useKpi => {
        const validators = [Validators.required];

        if (useKpi) {
          this.lowSeverityThreshold.setValidators(validators);
          this.mediumSeverityThreshold.setValidators(validators);
          this.highSeverityThreshold.setValidators(validators);
        } else {
          this.lowSeverityThreshold.clearValidators();
          this.mediumSeverityThreshold.clearValidators();
          this.highSeverityThreshold.clearValidators();
        }

        this.lowSeverityThreshold.updateValueAndValidity();
        this.mediumSeverityThreshold.updateValueAndValidity();
        this.highSeverityThreshold.updateValueAndValidity();
      })
    );
  }
}
