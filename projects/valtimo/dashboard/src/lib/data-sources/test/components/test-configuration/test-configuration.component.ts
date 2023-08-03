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
import {DataSourceConfigurationComponent} from '../../../../models';
import {Observable, Subscription} from 'rxjs';
import {FormBuilder, Validators} from '@angular/forms';
import {TestConfiguration} from '../../models';

@Component({
  templateUrl: './test-configuration.component.html',
  styleUrls: ['./test-configuration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestConfigurationComponent
  implements OnInit, OnDestroy, DataSourceConfigurationComponent
{
  @Input() dataSourceKey: string;
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() prefillConfiguration$: Observable<TestConfiguration>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<object> = new EventEmitter<TestConfiguration>();

  public readonly form = this.fb.group({
    value: this.fb.control(0, [Validators.required]),
    total: this.fb.control(0, [Validators.required]),
  });

  private _subscriptions = new Subscription();

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {}

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
