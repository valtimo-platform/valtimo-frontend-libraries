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
import {combineLatest, map, Observable, switchMap} from 'rxjs';
import {DocumentService} from '@valtimo/document';
import {ValuePathSelectorPrefix} from '../models/value-path-selector.model';

@Injectable({
  providedIn: 'root',
})
export class ValuePathSelectorService extends BaseApiService {
  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService,
    private readonly documentService: DocumentService
  ) {
    super(httpClient, configService);
  }

  public getDocumentProperties(
    documentDefinitionName: string,
    version?: number
  ): Observable<string[]> {
    return version
      ? this.getDocumentPropertiesApi(documentDefinitionName, version)
      : this.getLatestDocumentVersion(documentDefinitionName).pipe(
          switchMap(latestVersion =>
            this.getDocumentPropertiesApi(documentDefinitionName, latestVersion)
          )
        );
  }

  public getResolvableKeysPerPrefix(
    prefixes: ValuePathSelectorPrefix[],
    documentDefinitionName: string,
    version?: number
  ): Observable<{[key in ValuePathSelectorPrefix]: string[]}> {
    return combineLatest(
      prefixes.map(prefix => this.getResolvableKeys(prefix, documentDefinitionName, version))
    ).pipe(
      map(results => {
        return results.reduce((acc, curr, index) => ({...acc, [prefixes[index]]: curr}), {});
      })
    );
  }

  private getResolvableKeys(
    prefix: string,
    documentDefinitionName: string,
    version?: number
  ): Observable<any> {
    return version
      ? this.httpClient.get<string[]>(
          this.getApiUrl(
            `/v1/value-resolver/prefix/${prefix}/document-definition/${documentDefinitionName}/version/${version}/keys`
          )
        )
      : this.httpClient.get<string[]>(
          this.getApiUrl(
            `/v1/value-resolver/prefix/${prefix}/document-definition/${documentDefinitionName}/keys`
          )
        );
  }

  private getLatestDocumentVersion(documentDefinitionName): Observable<number> {
    return this.documentService.getDocumentDefinitionVersions(documentDefinitionName).pipe(
      map(result => {
        const versions = result?.versions;

        return !versions
          ? 1
          : versions.reduce((acc, curr) => {
              return Math.max(acc, curr);
            }, 0);
      })
    );
  }

  private getDocumentPropertiesApi(
    documentDefinitionName: string,
    version?: number
  ): Observable<any> {
    return this.httpClient.get<string[]>(
      this.getApiUrl(
        `/management/v1/document-definition/${documentDefinitionName}/version/${version}/properties`
      )
    );
  }
}
