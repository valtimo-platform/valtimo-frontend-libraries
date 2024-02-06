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

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigService} from '@valtimo/config';
import {BehaviorSubject, catchError, Observable, of, switchMap, take, tap} from 'rxjs';
import {DeleteFormFlowsRequest, FormFlowDefinition, ListFormFlowDefinition} from '../models';

@Injectable({providedIn: 'root'})
export class FormFlowService {
  public readonly formFlows$ = new BehaviorSubject<ListFormFlowDefinition[]>([]);
  public readonly loading$ = new BehaviorSubject<boolean>(false);

  private valtimoEndpointUri: string;

  private get formFlowDefinitions$(): Observable<ListFormFlowDefinition[]> {
    return this.http.get<ListFormFlowDefinition[]>(`${this.valtimoEndpointUri}v1/form-flow/definition`);
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpClient
  ) {
    this.valtimoEndpointUri = `${this.configService.config.valtimoApi.endpointUri}management/`;
  }

  public addFormFlow(definition: FormFlowDefinition): Observable<FormFlowDefinition> {
    return this.http.post<FormFlowDefinition>(`${this.valtimoEndpointUri}v1/form-flow/definition`, definition);
  }

  public deleteFormFlowDefinition(key: string): Observable<null> {
    return this.http.delete<null>(`${this.valtimoEndpointUri}v1/form-flow/definition/${key}`);
  }

  public dispatchAction(actionResult: Observable<FormFlowDefinition | null>): void {
    actionResult
      .pipe(
        tap(() => {
          this.loading$.next(true);
        }),
        switchMap(() => this.formFlowDefinitions$),
        take(1),
        catchError(error => of(error))
      )
      .subscribe({
        next: (formFlows: ListFormFlowDefinition[]) => {
          this.formFlows$.next(formFlows);
          this.loading$.next(false);
        },
        error: error => {
          console.error(error);
        },
      });
  }

  public loadFormFlows(): void {
    this.formFlowDefinitions$
      .pipe(
        tap(() => {
          this.loading$.next(true);
        }),
        take(1)
      )
      .subscribe({
        next: (items: ListFormFlowDefinition[]) => {
          this.formFlows$.next(items);
          this.loading$.next(false);
        },
        error: error => {
          console.error(error);
        },
      });
  }

  public getFormFlowDefinition(key: string): Observable<FormFlowDefinition> {
    return this.http.get<FormFlowDefinition>(
      `${this.valtimoEndpointUri}v1/form-flow/definition/${key}`
    );
  }

  public downloadFormFlowDefinition(key: string, version: number): Observable<object> {
    return this.http.get<object>(`${this.valtimoEndpointUri}v1/form-flow/definition/${key}/${version}/download`);
  }

  public updateFormFlowDefinition(key: string, updatedDefinition: FormFlowDefinition): Observable<FormFlowDefinition> {
    return this.http.put<FormFlowDefinition>(
      `${this.valtimoEndpointUri}v1/form-flow/definition/${key}`,
      updatedDefinition
    );
  }
}
