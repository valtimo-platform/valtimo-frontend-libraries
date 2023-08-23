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

import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, filter, Observable} from 'rxjs';
import {
  FormFlowAngularComponentDefinition,
  FormFlowCreateRequest,
  FormFlowCreateResult,
  FormFlowDefinition,
  FormFlowInstance,
} from '../models';
import {ConfigService} from '@valtimo/config';
import {FORM_FLOW_COMPONENT_TOKEN} from '../constants';

@Injectable({
  providedIn: 'root',
})
export class FormFlowService {
  private readonly _supportedComponents$ =
    new BehaviorSubject<Array<FormFlowAngularComponentDefinition> | null>(null);

  public get supportedComponents$(): Observable<Array<FormFlowAngularComponentDefinition>> {
    return this._supportedComponents$.pipe(filter(components => !!components));
  }

  private valtimoEndpointUri!: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    @Inject(FORM_FLOW_COMPONENT_TOKEN)
    private readonly supportedAngularComponents: Array<FormFlowAngularComponentDefinition>
  ) {
    this.valtimoEndpointUri = configService.config.valtimoApi.endpointUri;
    this.setSupportedComponents(supportedAngularComponents);
  }

  getFormFlowDefinitions(): Observable<FormFlowDefinition[]> {
    return this.http.get<FormFlowDefinition[]>(
      `${this.valtimoEndpointUri}v1/process-link/form-flow-definition`
    );
  }

  createInstanceForNewProcess(
    processDefinitionKey: string,
    request: FormFlowCreateRequest
  ): Observable<FormFlowCreateResult> {
    return this.http.post<FormFlowCreateResult>(
      `${this.valtimoEndpointUri}v1/process-definition/${processDefinitionKey}/form-flow`,
      request
    );
  }

  getFormFlowStep(formFlowInstanceId: string): Observable<FormFlowInstance> {
    return this.http.get<FormFlowInstance>(
      `${this.valtimoEndpointUri}v1/form-flow/${formFlowInstanceId}`
    );
  }

  submitStep(
    formFlowInstanceId: string,
    stepInstanceId: string,
    submissionData: any
  ): Observable<FormFlowInstance> {
    return this.http.post<FormFlowInstance>(
      `${this.valtimoEndpointUri}v1/form-flow/${formFlowInstanceId}/step/${stepInstanceId}`,
      submissionData
    );
  }

  back(formFlowInstanceId: string, submissionData: any): Observable<FormFlowInstance> {
    return this.http.post<FormFlowInstance>(
      `${this.valtimoEndpointUri}v1/form-flow/${formFlowInstanceId}/back`,
      submissionData
    );
  }

  save(formFlowInstanceId: string, submissionData: any): Observable<null> {
    return this.http.post<null>(
      `${this.valtimoEndpointUri}v1/form-flow/${formFlowInstanceId}/save`,
      submissionData
    );
  }

  private setSupportedComponents(
    supportedComponents: Array<FormFlowAngularComponentDefinition>
  ): void {
    this._supportedComponents$.next(supportedComponents);
  }
}
