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

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  FormOutput,
  MultiInputFormsValues,
  MultiInputFormValue,
  MultiInputKeyValue,
  MultiInputType,
  MultiInputValues,
} from '../../models';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'v-multi-input-form',
  templateUrl: './multi-input-form.component.html',
  styleUrls: ['./multi-input-form.component.scss'],
})
export class MultiInputFormComponent implements OnInit, OnDestroy {
  @Input() name = '';
  @Input() title = '';
  @Input() titleTranslationKey = '';
  @Input() type: MultiInputType = 'value';
  @Input() initialAmountOfRows = 1;
  @Input() minimumAmountOfRows = 1;
  @Input() maxRows = 20;
  @Input() addRowText = '';
  @Input() addRowTranslationKey = '';
  @Input() deleteRowText = '';
  @Input() deleteRowTranslationKey = '';
  @Input() disabled = false;
  @Input() defaultValues!: MultiInputValues;
  @Input() margin = false;
  @Input() tooltip = '';
  @Input() required = false;
  @Input() formTemplate!: TemplateRef<any>;
  @Output() valueChange: EventEmitter<Array<FormOutput>> = new EventEmitter();

  readonly values$ = new BehaviorSubject<MultiInputFormsValues>([]);

  readonly mappedValues$: Observable<Array<FormOutput>> = this.values$.pipe(
    map(values => values.map(value => value.value))
  );

  readonly addRowEnabled$: Observable<boolean> = this.values$.pipe(
    map(values => !!(values.length < this.maxRows))
  );

  private valuesSubscription!: Subscription;

  ngOnInit(): void {
    this.values$.next(this.getInitialRows());
    this.openValuesSubscription();
  }

  ngOnDestroy(): void {
    this.valuesSubscription?.unsubscribe();
  }

  addRow(): void {
    combineLatest([this.values$, this.addRowEnabled$])
      .pipe(take(1))
      .subscribe(([values, addRowEnabled]) => {
        if (addRowEnabled) {
          this.values$.next([...values, this.getEmptyValue()]);
        }
      });
  }

  deleteRow(uuid: string): void {
    this.values$.pipe(take(1)).subscribe(values => {
      if (values.length > this.minimumAmountOfRows) {
        this.values$.next(values.filter(value => value.uuid !== uuid));
      }
    });
  }

  trackByFn(index: number, value: MultiInputKeyValue): string {
    return value.uuid as string;
  }

  formValueChange = (newValue: FormOutput, rowIndex: number): void => {
    const currentValues = this.values$.getValue();
    const newValues: MultiInputFormsValues = [];

    currentValues.forEach((value, index) => {
      if (index === rowIndex) {
        newValues.push({uuid: value.uuid, value: newValue});
      } else {
        newValues.push(value);
      }
    });

    this.values$.next(newValues);
  };

  private getInitialRows(): MultiInputValues {
    const minimumRows = this.minimumAmountOfRows;
    const initialRows = this.initialAmountOfRows;
    const amountOfInitalRows =
      minimumRows > initialRows ? minimumRows : initialRows > 1 ? initialRows : 1;

    if (!this.defaultValues) {
      return new Array(amountOfInitalRows).fill(this.getEmptyValue());
    } else {
      return this.defaultValues.map(defaultValue => ({...defaultValue, uuid: uuidv4()}));
    }
  }

  private getEmptyValue(): MultiInputFormValue {
    return {
      value: {},
      uuid: uuidv4(),
    };
  }

  private openValuesSubscription(): void {
    this.valuesSubscription = this.values$.subscribe(values => {
      this.valueChange.emit(values);
    });
  }
}
