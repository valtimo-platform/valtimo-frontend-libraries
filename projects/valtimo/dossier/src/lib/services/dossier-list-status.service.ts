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
import {DossierListService} from './dossier-list.service';
import {DocumentStatusService, InternalDocumentStatus} from '@valtimo/document';
import {DossierParameterService} from './dossier-parameter.service';
import {Observable, switchMap} from 'rxjs';

@Injectable()
export class DossierListStatusService {
  private readonly _documentStatuses$: Observable<Array<InternalDocumentStatus>> =
    this.dossierListService.documentDefinitionName$.pipe(
      switchMap(documentDefinitionName =>
        this.documentStatusService.getDocumentStatuses(documentDefinitionName)
      )
    );

  get documentStatuses$(): Observable<Array<InternalDocumentStatus>> {
    return this._documentStatuses$;
  }

  constructor(
    private readonly dossierListService: DossierListService,
    private readonly documentStatusService: DocumentStatusService,
    private readonly dossierParameterService: DossierParameterService
  ) {}
}
