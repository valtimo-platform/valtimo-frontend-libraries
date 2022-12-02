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
import {ActivatedRoute} from '@angular/router';
import {DocumentService} from '@valtimo/document';
import {filter, map, Observable, switchMap} from 'rxjs';
import {ConfigService} from '@valtimo/config';

@Component({
  selector: 'valtimo-dossier-management-detail-container',
  templateUrl: './dossier-management-detail-container.component.html',
  styleUrls: ['./dossier-management-detail-container.component.css'],
})
export class DossierManagementDetailContainerComponent {
  caseListColumn!: boolean;
  caseSearchFields: boolean;

  public isCase = true;
  public isSearch = false;
  public isList = false;

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.name || ''),
    filter(docDefName => !!docDefName)
  );

  readonly documentDefinition$ = this.documentDefinitionName$.pipe(
    switchMap(documentDefinitionName =>
      this.documentService.getDocumentDefinition(documentDefinitionName)
    )
  );

  constructor(private documentService: DocumentService, private route: ActivatedRoute, private readonly configService: ConfigService) {
    this.caseListColumn = this.configService.config.featureToggles.caseListColumn;
    this.caseSearchFields = this.configService.config.featureToggles.caseSearchFields;
  }

  displayBodyComponent(tab: string): void {
    this.isCase = tab === 'case';
    this.isList = tab === 'list';
    this.isSearch = tab === 'search';
  }
}
