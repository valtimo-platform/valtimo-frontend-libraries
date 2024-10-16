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
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {Observable} from 'rxjs';
import {ConfiguredColumn} from '../models';

@Injectable({
  providedIn: 'root',
})
export class DocumentenApiColumnService extends BaseApiService {
  constructor(
    private http: HttpClient,
    configService: ConfigService
  ) {
    super(http, configService);
  }

  public getConfiguredColumns(caseDefinitionName: string): Observable<ConfiguredColumn[]> {
    return this.http.get<ConfiguredColumn[]>(
      this.getApiUrl(`/v1/case-definition/${caseDefinitionName}/zgw-document-column`)
    );
  }

  public getAdminConfiguredColumns(caseDefinitionName: string): Observable<ConfiguredColumn[]> {
    return this.http.get<ConfiguredColumn[]>(
      this.getApiUrl(`/management/v1/case-definition/${caseDefinitionName}/zgw-document-column`)
    );
  }

  public getAdminConfigurableColumns(caseDefinition: string): Observable<ConfiguredColumn[]> {
    return this.http.get<ConfiguredColumn[]>(
      this.getApiUrl(`/management/v1/case-definition/${caseDefinition}/zgw-document-column-key`)
    );
  }

  public deleteColumn(caseDefinitionName: string, columnKey: string): Observable<void> {
    return this.http.delete<void>(
      this.getApiUrl(
        `/management/v1/case-definition/${caseDefinitionName}/zgw-document-column/${columnKey}`
      )
    );
  }

  public updateColumn(caseDefinitionName: string, column: ConfiguredColumn): Observable<void> {
    return this.http.put<void>(
      this.getApiUrl(
        `/management/v1/case-definition/${caseDefinitionName}/zgw-document-column/${column.key}`
      ),
      column
    );
  }

  public updateConfiguredColumns(
    caseDefinitionKey: string,
    orderColumns: ConfiguredColumn[]
  ): Observable<null> {
    return this.http.put<null>(
      this.getApiUrl(`/management/v1/case-definition/${caseDefinitionKey}/zgw-document-column`),
      orderColumns
    );
  }
}
