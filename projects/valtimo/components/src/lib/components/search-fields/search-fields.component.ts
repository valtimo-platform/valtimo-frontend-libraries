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
import {SearchField, SearchFieldValue, SearchFieldWithValue} from '@valtimo/config';
import {BehaviorSubject, combineLatest, Subscription, take} from 'rxjs';

@Component({
  selector: 'valtimo-search-fields',
  templateUrl: './search-fields.component.html',
  styleUrls: ['./search-fields.component.scss'],
})
export class SearchFieldsComponent implements OnInit, OnDestroy {
  readonly searchFields$ = new BehaviorSubject<Array<SearchField>>([]);

  readonly values$ = new BehaviorSubject<{[key: string]: SearchFieldValue}>({});

  @Input() loading: boolean;
  @Input() set searchFields(fields: Array<SearchField>) {
    this.searchFields$.next(fields);
  }
  @Output() valueChange: EventEmitter<Array<SearchFieldWithValue>> = new EventEmitter<
    Array<SearchFieldWithValue>
  >();

  valuesSubscription!: Subscription;

  ngOnInit() {
    this.openValuesSubscription();
  }

  ngOnDestroy(): void {
    this.valuesSubscription?.unsubscribe();
  }

  singleValueChange(searchFieldKey: string, value: any): void {
    this.values$.pipe(take(1)).subscribe(values => {
      this.values$.next({...values, [searchFieldKey]: value});
    });
  }

  multipleValueChange(searchFieldKey: string, value: any): void {
    this.values$.pipe(take(1)).subscribe(values => {
      this.values$.next({...values, [searchFieldKey]: {start: value.start, end: value.end}});
    });
  }

  private openValuesSubscription(): void {
    this.valuesSubscription = combineLatest([this.searchFields$, this.values$]).subscribe(
      ([searchFields, values]) => {
        const valuesKeys = Object.keys(values);
        const searchFieldsCopy = [...(searchFields || [])] as Array<SearchFieldWithValue>;

        valuesKeys.forEach(valueKey => {
          const correspondingSearchFieldIndex = searchFieldsCopy.findIndex(
            searchField => searchField.key === valueKey
          );

          if (correspondingSearchFieldIndex !== -1) {
            searchFieldsCopy[correspondingSearchFieldIndex].value = values[valueKey];
          }
        });

        console.log(searchFieldsCopy);

        this.valueChange.emit(searchFieldsCopy);
      }
    );
  }
}
