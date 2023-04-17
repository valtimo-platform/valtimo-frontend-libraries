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

import {Injectable} from '@angular/core';
import {map, Observable, take} from 'rxjs';
import {DossierListService} from './dossier-list.service';
import {AdvancedDocumentSearchRequest} from '@valtimo/document';
import {NGXLogger} from 'ngx-logger';

@Injectable()
export class DossierListLocalStorageService {
  private readonly _storedSearchRequestKey$: Observable<string> =
    this.dossierListService.documentDefinitionName$.pipe(
      map(documentDefinitionName => `list-search-${documentDefinitionName}`)
    );

  private readonly _hasStoredSearchRequest$: Observable<boolean> =
    this._storedSearchRequestKey$.pipe(
      map(storedSearchRequestKey => localStorage.getItem(storedSearchRequestKey) !== null)
    );

  get storedSearchRequestKey$(): Observable<string> {
    return this._storedSearchRequestKey$;
  }

  get hasStoredSearchRequest$(): Observable<boolean> {
    return this._hasStoredSearchRequest$;
  }

  constructor(
    private readonly dossierListService: DossierListService,
    private readonly logger: NGXLogger
  ) {}

  storeSearchRequestInLocalStorage(searchRequest: AdvancedDocumentSearchRequest): void {
    this._storedSearchRequestKey$.pipe(take(1)).subscribe(storedSearchRequestKey => {
      this.logger.debug(`store request in local storage: ${JSON.stringify(searchRequest)}`);
      localStorage.setItem(storedSearchRequestKey, JSON.stringify(searchRequest));
    });
  }
}
