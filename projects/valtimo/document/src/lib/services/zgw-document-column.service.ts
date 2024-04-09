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
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
  AssigneeFilter, BaseApiService,
  ConfigService,
  NamedUser,
  SearchField,
  SearchFilter,
  SearchFilterRange,
  SearchOperator,
} from '@valtimo/config';
import {InterceptorSkip} from '@valtimo/security';
import {catchError, Observable, of, switchMap, tap} from 'rxjs';

import {
  AssignHandlerToDocumentResult,
  AuditRecord,
  CaseListColumn,
  CaseSettings,
  CreateDocumentDefinitionResponse,
  Document,
  DocumentDefinition,
  DocumentDefinitionCreateRequest,
  DocumentDefinitions,
  DocumentDefinitionVersionsResult,
  DocumentResult,
  Documents,
  DocumentSendMessageRequest,
  DocumentType,
  ModifyDocumentAndCompleteTaskRequestImpl,
  ModifyDocumentAndCompleteTaskResult,
  ModifyDocumentAndStartProcessRequestImpl,
  ModifyDocumentAndStartProcessResult,
  NewDocumentAndStartProcessRequestImpl,
  NewDocumentAndStartProcessResult,
  OpenDocumentCount,
  Page,
  ProcessDocumentDefinition,
  ProcessDocumentDefinitionRequest,
  ProcessDocumentInstance,
  RelatedFile,
  SpecifiedDocuments,
  TemplatePayload,
  TemplateResponse,
  UndeployDocumentDefinitionResult,
  UploadProcessLink,
} from '../models';
import {AdvancedDocumentSearchRequest} from '../models/advanced-document-search-request';
import {DocumentSearchRequest} from '../models/document-search-request';
import {ConfiguredColumn} from '../models/configured-column.model';

@Injectable({
  providedIn: 'root',
})
export class ZgwDocumentColumnService extends BaseApiService{

  constructor(
    private http: HttpClient,
    configService: ConfigService
  ) {
    super(http, configService);
  }

  public getConfiguredColumns(caseDefinitionName: string): Observable<ConfiguredColumn[]> {
    return this.http.get<ConfiguredColumn[]>(
      this.getApiUrl(`/management/v1/case-definition/${caseDefinitionName}/zgw-document-column`)
    );
  }

  public updateColumnOrder(caseDefinitionName: string, columns: ConfiguredColumn[]): Observable<void> {
    return this.http.put<void>(
      this.getApiUrl(`/management/v1/case-definition/${caseDefinitionName}/zgw-document-column`),
      columns
    );
  }

  public updateColumn(caseDefinitionName: string, column: ConfiguredColumn): Observable<void> {
    delete column.key;
    return this.http.put<void>(
      this.getApiUrl(`/management/v1/case-definition/${caseDefinitionName}/zgw-document-column/${column.key}`),
      column
    );
  }
}
