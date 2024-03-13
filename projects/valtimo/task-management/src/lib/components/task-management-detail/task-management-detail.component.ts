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

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CarbonListModule, PageTitleService} from '@valtimo/components';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {filter, map, Observable, switchMap, tap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DocumentDefinition, DocumentService} from '@valtimo/document';

@Component({
  templateUrl: './task-management-detail.component.html',
  styleUrls: ['./task-management-detail.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CarbonListModule, TranslateModule],
})
export class TaskManagementDetailComponent {
  public readonly setDocumentDefinitionName$: Observable<DocumentDefinition> =
    this.route.params.pipe(
      map(params => params.name || ''),
      filter(docDefName => !!docDefName),
      switchMap(documentDefinitionName =>
        this.documentService.getDocumentDefinition(documentDefinitionName)
      ),
      tap(documentDefinition => {
        this.pageTitleService.setCustomPageTitle((documentDefinition as any)?.schema?.title || '-');
      })
    );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly documentService: DocumentService,
    private readonly pageTitleService: PageTitleService
  ) {}
}
