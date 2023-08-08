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
import {
  ListItemWithId,
  MultiInputKeyValue,
  MultiInputOutput,
  MultiInputType,
  MultiInputValues,
} from '../../models';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'valtimo-carbon-multi-input',
  templateUrl: './carbon-multi-input.component.html',
  styleUrls: ['./carbon-multi-input.component.scss'],
})
export class CarbonMultiInputComponent implements OnInit, OnDestroy {
  @Input() public name = '';
  @Input() public title = '';
  @Input() public titleTranslationKey = '';
  @Input() public type: MultiInputType = 'value';
  @Input() public initialAmountOfRows = 1;
  @Input() public minimumAmountOfRows = 1;
  @Input() public maxRows = null;
  @Input() public addRowText = '';
  @Input() public addRowTranslationKey = '';
  @Input() public deleteRowText = '';
  @Input() public deleteRowTranslationKey = '';
  @Input() public disabled = false;
  @Input() public defaultValues!: MultiInputValues;
  @Input() public margin = false;
  @Input() public tooltip = '';
  @Input() public required = false;
  @Input() public keyColumnTitle = '';
  @Input() public valueColumnTitle = '';
  @Input() public dropdownColumnTitle = '';
  @Input() public hideDeleteButton = false;
  @Input() public hideAddButton = false;
  @Input() public set dropdownItems(value: Array<ListItemWithId>) {
    this.dropdownItems$.next(value);
  }
  @Input() public selectedDropdownItem(id: string) {}
  @Input() public dropdownWidth = 250;
  @Input() public fullWidth = false;

  @Output() public valueChange: EventEmitter<MultiInputOutput> = new EventEmitter();

  public readonly values$ = new BehaviorSubject<MultiInputValues>([]);
  public readonly mappedValues$: Observable<MultiInputOutput> = this.values$.pipe(
    map(
      values =>
        values
          .map(value => this.getMappedValue(value))
          .filter(value => {
            switch (this.type) {
              case 'value':
                return value;
              case 'keyValue':
                return (value as MultiInputKeyValue).value && (value as MultiInputKeyValue).key;
              case 'keyDropdownValue':
                return (
                  (value as MultiInputKeyValue).value &&
                  (value as MultiInputKeyValue).key &&
                  (value as MultiInputKeyValue).dropdown
                );
            }
          }) as MultiInputOutput
    )
  );
  public readonly addRowEnabled$: Observable<boolean> = this.values$.pipe(
    map(values => !!(this.maxRows === null || values.length < this.maxRows))
  );

  public readonly dropdownItems$ = new BehaviorSubject<Array<ListItemWithId>>([]);

  private _valuesSubscription!: Subscription;

  public ngOnInit(): void {
    this.values$.next(this.getInitialRows());
    this.openValuesSubscription();
  }

  public ngOnDestroy(): void {
    this._valuesSubscription?.unsubscribe();
  }

  public addRow(): void {
    combineLatest([this.values$, this.addRowEnabled$])
      .pipe(take(1))
      .subscribe(([values, addRowEnabled]) => {
        if (addRowEnabled) {
          this.values$.next([...values, this.getEmptyValue()]);
        }
      });
  }

  public deleteRow(uuid: string): void {
    this.values$.pipe(take(1)).subscribe(values => {
      if (values.length > this.minimumAmountOfRows) {
        this.values$.next(values.filter(value => value.uuid !== uuid));
      }
    });
  }

  public trackByFn(index: number, value: MultiInputKeyValue): string {
    return value.uuid as string;
  }

  public getDropdownItemsForRow(index: number): Observable<Array<ListItemWithId>> {
    return combineLatest([this.dropdownItems$, this.values$]).pipe(
      map(([dropdownItems, values]) => {
        const defaultValue = values[index] || this.defaultValues[index];

        return dropdownItems.map(dropdownItem => ({
          ...dropdownItem,
          selected: defaultValue ? dropdownItem.id === defaultValue.dropdown : false,
        }));
      })
    );
  }

  public onValueChange(
    templateValue: MultiInputKeyValue,
    inputValue: string,
    change: 'key' | 'value' | 'dropdown'
  ): void {
    this.values$.pipe(take(1)).subscribe(values => {
      this.values$.next(
        values.map(stateValue => {
          if (stateValue.uuid === templateValue.uuid) {
            if (change === 'value') {
              return {...stateValue, value: inputValue};
            } else if (change === 'key') {
              return {...stateValue, key: inputValue};
            } else if (change === 'dropdown') {
              return {...stateValue, dropdown: inputValue};
            }
          }
          return stateValue;
        })
      );
    });
  }

  private getInitialRows(): MultiInputValues {
    const minimumRows = this.minimumAmountOfRows;
    const initialRows = this.initialAmountOfRows;
    const amountOfInitalRows =
      minimumRows > initialRows ? minimumRows : initialRows > 1 ? initialRows : 1;

    if (!this.defaultValues) {
      return new Array(amountOfInitalRows).fill(this.getEmptyValue());
    }

    return this.defaultValues.map(defaultValue => ({...defaultValue, uuid: uuidv4()}));
  }

  private getEmptyValue(): MultiInputKeyValue {
    return {
      key: '',
      value: '',
      uuid: uuidv4(),
      dropdown: '',
    };
  }

  private getMappedValue(valueToMap: MultiInputKeyValue): MultiInputKeyValue | string {
    if (this.type === 'keyValue') {
      return {key: valueToMap.key, value: valueToMap.value};
    } else if (this.type === 'keyDropdownValue') {
      return {key: valueToMap.key, value: valueToMap.value, dropdown: valueToMap.dropdown};
    }

    return valueToMap.value;
  }

  private openValuesSubscription(): void {
    this._valuesSubscription = this.mappedValues$.subscribe(values => {
      this.valueChange.emit(values);
    });
  }
}
