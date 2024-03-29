/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ConfigService} from '@valtimo/config';
import {Customer, CustomerCase, CustomerSearchRequest} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private valtimoEndpointUri: string;

  constructor(
    private http: HttpClient,
    configService: ConfigService
  ) {
    this.valtimoEndpointUri = configService.config.valtimoApi.endpointUri;
  }

  getCustomers(request: CustomerSearchRequest): Observable<Array<Customer>> {
    return this.http.post<Array<Customer>>(
      `${this.valtimoEndpointUri}v1/haalcentraal/personen`,
      request
    );
  }

  getCustomerCases(bsn: string): Observable<Array<CustomerCase>> {
    return this.http.get<Array<CustomerCase>>(`${this.valtimoEndpointUri}v1/zaken/${bsn}`);
  }
}
