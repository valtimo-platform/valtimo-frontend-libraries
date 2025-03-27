/*
 * Copyright 2015-2025 Ritense BV, the Netherlands.
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
import {HttpClient} from '@angular/common/http';
import {
  CreateFormDefinitionRequest,
  FormDefinition,
  ModifyFormDefinitionRequest,
  QueryFormsResponse,
} from '../models';
import {Observable} from 'rxjs';
import {ConfigService} from '@valtimo/config';

@Injectable({
  providedIn: 'root',
})
export class FormManagementService {
  private valtimoApiConfig: any;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.valtimoApiConfig = configService.config.valtimoApi;
  }

  public getFormDefinition(formDefinitionId: string): Observable<FormDefinition> {
    return this.http.get<FormDefinition>(
      `${this.valtimoApiConfig.endpointUri}v1/form-management/${formDefinitionId}`
    );
  }

  public existsFormDefinition(formDefinitionName: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.valtimoApiConfig.endpointUri}v1/form-management/exists/${formDefinitionName}`
    );
  }

  public queryFormDefinitions(params?: any): Observable<QueryFormsResponse> {
    return this.http.get<QueryFormsResponse>(
      `${this.valtimoApiConfig.endpointUri}v1/form-management`,
      {
        params,
      }
    );
  }

  public queryFormDefinitionsCase(
    caseDefinitionKey: string,
    versionTag: string,
    params?: any
  ): Observable<QueryFormsResponse> {
    return this.http.get<QueryFormsResponse>(
      `${this.valtimoApiConfig.endpointUri}management/v1/case-definition/${caseDefinitionKey}/version/${versionTag}/form`,
      {
        params,
      }
    );
  }

  public createFormDefinition(request: CreateFormDefinitionRequest): Observable<FormDefinition> {
    return this.http.post<FormDefinition>(
      `${this.valtimoApiConfig.endpointUri}v1/form-management`,
      request
    );
  }

  public createFormDefinitionsCase(
    caseDefinitionKey: string,
    versionTag: string,
    request: CreateFormDefinitionRequest
  ): Observable<FormDefinition> {
    return this.http.post<FormDefinition>(
      `${this.valtimoApiConfig.endpointUri}management/v1/case-definition/${caseDefinitionKey}/version/${versionTag}/form`,
      request
    );
  }

  public modifyFormDefinition(request: ModifyFormDefinitionRequest): Observable<FormDefinition> {
    return this.http.put<FormDefinition>(
      `${this.valtimoApiConfig.endpointUri}v1/form-management`,
      request
    );
  }

  public modifyFormDefinitionCase(
    caseDefinitionKey: string,
    versionTag: string,
    request: ModifyFormDefinitionRequest
  ): Observable<FormDefinition> {
    return this.http.put<FormDefinition>(
      `${this.valtimoApiConfig.endpointUri}management/v1/case-definition/${caseDefinitionKey}/version/${versionTag}/form`,
      request
    );
  }

  public deleteFormDefinition(formDefinitionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.valtimoApiConfig.endpointUri}v1/form-management/${formDefinitionId}`
    );
  }

  public deleteFormDefinitionCase(
    caseDefinitionKey: string,
    versionTag: string,
    formDefinitionId: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.valtimoApiConfig.endpointUri}management/v1/case-definition/${caseDefinitionKey}/version/${versionTag}/form/${formDefinitionId}`
    );
  }
}
