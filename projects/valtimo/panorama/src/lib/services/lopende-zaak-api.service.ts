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

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {Observable} from 'rxjs';
import {LopendeZaak} from '../models';

@Injectable({
  providedIn: 'root',
})
export class LopendeZaakApiService extends BaseApiService {
  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
  }

  public getLopendeZaken(bsn: string | null): Observable<{results: LopendeZaak[]}> {
    return this.httpClient.get<{results: LopendeZaak[]}>(`/api/v1/profile/${bsn}/lopende-zaken`, {
      headers: {
        'X-API-KEY': '49*HwbhRvxf!6vt7GnXj8xpmmZ87m9sK',
      },
    });
  }
}
