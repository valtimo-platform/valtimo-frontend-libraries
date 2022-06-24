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
import {MultiInputKeyValueOutput, MultiInputType, MultiInputValueOutput} from '../../models';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';

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

  @Output() valueChange: EventEmitter<MultiInputValueOutput | MultiInputKeyValueOutput> =
    new EventEmitter();

  readonly inputsAmount$ = new BehaviorSubject<Array<null>>(this.getInputRows(this.initialRows));
  readonly addRowEnabled$: Observable<boolean> = this.inputsAmount$.pipe(
    map(inputsAmount => !!(inputsAmount.length < this.maxRows))
  );

  addRow(): void {
    combineLatest([this.inputsAmount$, this.addRowEnabled$])
      .pipe(take(1))
      .subscribe(([inputsAmount, addRowEnabled]) => {
        if (addRowEnabled) {
          this.inputsAmount$.next([...inputsAmount, null]);
        }
      });
  }

  deleteRow(index: number): void {
    this.inputsAmount$.pipe(take(1)).subscribe(inputsAmount => {
      if (inputsAmount.length > 0) {
        this.inputsAmount$.next(inputsAmount.slice(0, -1));
      }
    });
  }

  private getInputRows(amount: number): Array<null> {
    return new Array(amount).fill(null);
  }
}
