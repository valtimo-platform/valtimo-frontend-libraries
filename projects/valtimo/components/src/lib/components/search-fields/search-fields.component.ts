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
import {SearchField, SearchFieldBoolean, SearchFieldValues} from '@valtimo/config';
import {BehaviorSubject, map, Observable, Subject, Subscription, take} from 'rxjs';
import {SelectItem} from '@valtimo/user-interface';
import {TranslateService} from '@ngx-translate/core';

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
  @Input() set documentDefinitionName(documentDefinitionName: string) {
    this.documentDefinitionName$.pipe(take(1)).subscribe(currentDocumentDefinitionName => {
      if (currentDocumentDefinitionName !== documentDefinitionName) {
        this.documentDefinitionName$.next(documentDefinitionName);
      }
    });
  }
  @Output() doSearch: EventEmitter<SearchFieldValues> = new EventEmitter<SearchFieldValues>();

  readonly documentDefinitionName$ = new BehaviorSubject<string>('');

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

  private documentDefinitionNameSubscription!: Subscription;

  readonly BOOLEANTYPES: Array<SearchFieldBoolean> = ['yes', 'no', 'either'];
  readonly booleanItems$: Observable<Array<SelectItem>> = this.translateService.stream('key').pipe(
    map(() =>
      this.BOOLEANTYPES.map(type => ({
        id: type,
        text: this.translateService.instant(`searchFields.${type}`),
      }))
    )
  );

  constructor(private readonly translateService: TranslateService) {}

  ngOnInit() {
    this.openDocumentDefinitionNameSubscription();
  }

  ngOnDestroy(): void {
    this.documentDefinitionNameSubscription?.unsubscribe();
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

  private openDocumentDefinitionNameSubscription(): void {
    this.documentDefinitionNameSubscription = this.documentDefinitionName$.subscribe(() => {
      this.collapse();
      this.clear();
    });
  }

  private collapse(): void {
    this.expanded$.next(false);
  }
}
