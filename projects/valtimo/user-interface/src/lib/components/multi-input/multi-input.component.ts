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

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MultiInputKeyValue, MultiInputType, MultiInputValues} from '../../models';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'v-multi-input',
  templateUrl: './multi-input.component.html',
  styleUrls: ['./multi-input.component.scss'],
})
export class MultiInputComponent {
  @Input() name = '';
  @Input() title = '';
  @Input() titleTranslationKey = '';
  @Input() type: MultiInputType = 'value';
  @Input() initialRows: number = 1;
  @Input() maxRows: number = 20;
  @Input() addRowText = '';
  @Input() addRowTranslationKey = '';
  @Input() deleteRowText = '';
  @Input() deleteRowTranslationKey = '';

  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  readonly values$ = new BehaviorSubject<MultiInputValues>(this.getInputRows(this.initialRows));
  readonly addRowEnabled$: Observable<boolean> = this.values$.pipe(
    map(values => !!(values.length < this.maxRows))
  );

  addRow(): void {
    combineLatest([this.values$, this.addRowEnabled$])
      .pipe(take(1))
      .subscribe(([values, addRowEnabled]) => {
        if (addRowEnabled) {
          this.values$.next([...values, this.getEmptyValue() as any]);
        }
      });
  }

  deleteRow(uuid: string): void {
    this.values$.pipe(take(1)).subscribe(values => {
      if (values.length > 1) {
        this.values$.next(values.filter(value => value.uuid !== uuid));
      }
    });
  }

  trackByFn(index: number, value: MultiInputKeyValue): string {
    return value.uuid;
  }

  private getInputRows(amount: number): MultiInputValues {
    return new Array(amount).fill(this.getEmptyValue());
  }

  private getEmptyValue(): MultiInputKeyValue {
    return {
      key: '',
      value: '',
      uuid: uuidv4(),
    };
  }
}
