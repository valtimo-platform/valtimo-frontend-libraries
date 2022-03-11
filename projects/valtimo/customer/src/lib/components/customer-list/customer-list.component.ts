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

import {Component} from '@angular/core';
import {CustomerService} from '../../services/customer.service';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {map, tap, switchMap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {
  CustomerBsnSearchRequest,
  CustomerDataSearchRequest,
  CustomerSearchRequest,
  MappedCustomer,
} from '../../models';

@Component({
  selector: 'valtimo-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
})
export class CustomerListComponent {
  fields$: Observable<Array<{key: string; label: string}>> = combineLatest([
    this.translateService.stream('customers.name'),
    this.translateService.stream('customers.citizenServiceNumber'),
    this.translateService.stream('customers.dateOfBirth'),
  ]).pipe(
    map(([nameLabel, numberLabel, dateOfBirthLabel]) => {
      return [
        {
          label: numberLabel,
          key: 'citizenServiceNumber',
        },
        {
          label: nameLabel,
          key: 'name',
        },
        {
          label: dateOfBirthLabel,
          key: 'dateOfBirth',
        },
      ];
    })
  );

  private readonly searchParameters$ = new BehaviorSubject<CustomerSearchRequest | undefined>(
    undefined
  );

  customers$: Observable<Array<MappedCustomer>> = this.searchParameters$.pipe(
    switchMap(searchParameters => {
      if (
        (searchParameters as CustomerBsnSearchRequest)?.bsn ||
        ((searchParameters as CustomerDataSearchRequest)?.geslachtsnaam &&
          (searchParameters as CustomerDataSearchRequest)?.geboortedatum)
      ) {
        return this.customerService.getCustomers(searchParameters as CustomerSearchRequest);
      } else {
        return of([]);
      }
    }),
    map(customers =>
      customers.map(customer => ({
        citizenServiceNumber: customer.burgerservicenummer,
        dateOfBirth: customer.geboorteDatum,
        name: `${customer.geslachtsnaam}, ${customer.voornamen} ${customer.voorletters}`,
      }))
    ),
    tap(() => {
      this.loading$.next(false);
    })
  );

  readonly loading$ = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly customerService: CustomerService,
    private readonly translateService: TranslateService
  ) {}
}
