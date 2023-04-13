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
import {map, Observable, switchMap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DossierColumnService} from '../services';
import {DocumentService} from '@valtimo/document';

@Injectable()
export class DossierListService {
  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.documentDefinitionName || '')
  );

  readonly hasEnvColumnConfig$: Observable<boolean> = this.documentDefinitionName$.pipe(
    map(documentDefinitionName =>
      this.dossierColumnService.hasEnvironmentConfig(documentDefinitionName)
    )
  );

  readonly canHaveAssignee$: Observable<boolean> = this.documentDefinitionName$.pipe(
    switchMap(documentDefinitionName =>
      this.documentService.getCaseSettings(documentDefinitionName)
    ),
    map(caseSettings => caseSettings?.canHaveAssignee)
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dossierColumnService: DossierColumnService,
    private readonly documentService: DocumentService
  ) {}
}
