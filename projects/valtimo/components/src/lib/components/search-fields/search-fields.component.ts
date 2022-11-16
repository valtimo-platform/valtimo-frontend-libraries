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
import {SearchField, SearchFieldValues, SearchFieldWithValue} from '@valtimo/config';
import {BehaviorSubject, combineLatest, map, Observable, Subject, Subscription, take} from 'rxjs';

@Component({
  selector: 'valtimo-search-fields',
  templateUrl: './search-fields.component.html',
  styleUrls: ['./search-fields.component.scss'],
})
export class SearchFieldsComponent implements OnInit, OnDestroy {
  @Input() loading: boolean;
  @Input() set searchFields(fields: Array<SearchField>) {
    this.searchFields$.next(fields);
  }
  @Output() valueChange: EventEmitter<Array<SearchFieldWithValue>> = new EventEmitter<
    Array<SearchFieldWithValue>
  >();
  @Output() doSearch: EventEmitter<SearchFieldValues> = new EventEmitter<SearchFieldValues>();
  @Input() clearFields$!: Observable<null>;

  readonly searchFields$ = new BehaviorSubject<Array<SearchField>>([]);

  readonly values$ = new BehaviorSubject<SearchFieldValues>({});

  readonly hasValidValues$: Observable<boolean> = this.values$.pipe(
    map(values => {
      const hasValues = (Object.keys(values) || []).length > 0;
      const rangeValues =
        (hasValues && Object.values(values)?.filter(value => (value as any).start)) || [];
      const validRangeValues = rangeValues?.filter(
        value => (value as any).start < (value as any).end
      );

      return !!(hasValues && rangeValues.length === validRangeValues.length);
    })
  );

  readonly expanded$ = new BehaviorSubject<boolean>(false);

  readonly clear$ = new Subject<null>();

  private valuesSubscription!: Subscription;
  private clearSubscription!: Subscription;

  ngOnInit() {
    this.openValuesSubscription();
    this.openClearSubscription();
  }

  ngOnDestroy(): void {
    this.valuesSubscription?.unsubscribe();
    this.clearSubscription?.unsubscribe();
  }

  singleValueChange(searchFieldKey: string, value: any): void {
    this.values$.pipe(take(1)).subscribe(values => {
      if (value) {
        this.values$.next({...values, [searchFieldKey]: value});
      } else if (values[searchFieldKey]) {
        const valuesCopy = {...values};
        delete valuesCopy[searchFieldKey];
        this.values$.next(valuesCopy);
      }
    });
  }

  multipleValueChange(searchFieldKey: string, value: any): void {
    this.values$.pipe(take(1)).subscribe(values => {
      if (value.start && value.end) {
        this.values$.next({...values, [searchFieldKey]: {start: value.start, end: value.end}});
      } else if (values[searchFieldKey]) {
        const valuesCopy = {...values};
        delete valuesCopy[searchFieldKey];
        this.values$.next(valuesCopy);
      }
    });
  }

  toggleExpanded(): void {
    this.expanded$.pipe(take(1)).subscribe(expanded => {
      this.expanded$.next(!expanded);
    });
  }

  search(): void {
    this.values$.pipe(take(1)).subscribe(values => {
      this.doSearch.emit(values);
    });
  }

  clear(): void {
    this.clear$.next(null);
    this.doSearch.emit({});
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

        this.valueChange.emit(searchFieldsCopy);
      }
    );
  }

  private openClearSubscription(): void {
    if (this.clearFields$) {
      this.clearSubscription = this.clearFields$.subscribe(() => {
        this.clear();
      });
    }
  }
}
