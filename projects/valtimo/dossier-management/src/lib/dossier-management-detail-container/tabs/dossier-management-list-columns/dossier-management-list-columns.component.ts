/*
 * Copyright 2015-2022 Ritense BV, the Netherlands.
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
import {ListField} from '@valtimo/components';
import {DefinitionColumn} from '@valtimo/config';
import {filter, map, Observable, switchMap} from 'rxjs';
import {CaseListColumnView, DocumentService} from '@valtimo/document';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'valtimo-dossier-management-list-columns',
  templateUrl: './dossier-management-list-columns.component.html',
  styleUrls: ['./dossier-management-list-columns.component.css'],
})
export class DossierManagementListColumnsComponent {
  private readonly COLUMNS: Array<DefinitionColumn> = [
    {
      viewType: 'string',
      sortable: false,
      propertyName: 'title',
      translationKey: 'title',
    },
    {
      viewType: 'string',
      sortable: false,
      propertyName: 'key',
      translationKey: 'key',
    },
    {
      viewType: 'string',
      sortable: false,
      propertyName: 'path',
      translationKey: 'path',
    },
    {
      viewType: 'string',
      sortable: false,
      propertyName: 'displayType',
      translationKey: 'displayType',
    },
    {
      viewType: 'string',
      sortable: false,
      propertyName: 'displayTypeParameters',
      translationKey: 'displayTypeParameters',
    },
    {
      viewType: 'boolean',
      sortable: false,
      propertyName: 'sortable',
      translationKey: 'sortable',
    },
    {
      viewType: 'string',
      sortable: false,
      propertyName: 'defaultSort',
      translationKey: 'defaultSort',
    },
  ];

  readonly fields$: Observable<Array<ListField>> = this.translateService.stream('key').pipe(
    map(() =>
      this.COLUMNS.map(column => ({
        key: column.propertyName,
        label: this.translateService.instant(`listColumn.${column.translationKey}`),
        sortable: column.sortable,
        ...(column.viewType && {viewType: column.viewType}),
        ...(column.enum && {enum: column.enum}),
      }))
    )
  );

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.name || ''),
    filter(docDefName => !!docDefName)
  );

  readonly caseListColumns$: Observable<Array<CaseListColumnView>> =
    this.documentDefinitionName$.pipe(
      switchMap(documentDefinitionName => this.documentService.getCaseList(documentDefinitionName)),
      map(columns =>
        columns.map(column => ({
          ...column,
          title: column.title || '-',
          displayType: column.displayType.type,
          displayTypeParameters:
            column.displayType.displayTypeParameters &&
            Object.keys(column.displayType.displayTypeParameters).length > 0
              ? JSON.stringify(column.displayType.displayTypeParameters)
              : '-',
        }))
      )
    );

  constructor(
    private readonly documentService: DocumentService,
    private readonly route: ActivatedRoute,
    private readonly translateService: TranslateService
  ) {}
}
