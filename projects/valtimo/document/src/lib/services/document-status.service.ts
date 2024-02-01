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
import {BaseApiService, ConfigService} from '@valtimo/config';
import {HttpClient} from '@angular/common/http';
import {InternalDocumentStatus} from '../models/internal-document-status.model';
import {delay, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentStatusService extends BaseApiService {
  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
  }

  public getDocumentStatuses(documentDefinitionName: string): Observable<InternalDocumentStatus[]> {
    const url = this.getApiUrl(`/document/status/${documentDefinitionName}`);
    console.log(url);

    return of([
      {
        key: 'test',
        title: 'test',
        documentDefinitionName: 'test',
        visibleInCaseListByDefault: true,
        order: 0,
      },
      {
        key: 'test2',
        title: '2',
        documentDefinitionName: 'test',
        visibleInCaseListByDefault: false,
        order: 1,
      },
    ] as InternalDocumentStatus[]).pipe(delay(1000));
  }
}
