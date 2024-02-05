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
import {DeleteFormFlowsRequest, FormFlow} from '../models';

@Injectable({providedIn: 'root'})
export class FormFlowService {
  public readonly formFlows$ = new BehaviorSubject<FormFlow[]>([]);
  public readonly loading$ = new BehaviorSubject<boolean>(false);

  private valtimoEndpointUri: string;

  private get formFlowDtos$(): Observable<FormFlow[]> {
    return this.http.get<FormFlow[]>(`${this.valtimoEndpointUri}v1/form-flow`);
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpClient
  ) {
    this.valtimoEndpointUri = `${this.configService.config.valtimoApi.endpointUri}management/`;
  }

  public addFormFlow(formFlow: FormFlow): Observable<FormFlow> {
    return this.http.post<FormFlow>(`${this.valtimoEndpointUri}v1/form-flow`, formFlow);
  }

  public deleteFormFlows(request: DeleteFormFlowsRequest): Observable<null> {
    return this.http.delete<null>(`${this.valtimoEndpointUri}v1/form-flow`, {body: request});
  }

  public dispatchAction(actionResult: Observable<FormFlow | null>): void {
    actionResult
      .pipe(
        tap(() => {
          this.loading$.next(true);
        }),
        switchMap(() => this.formFlowDtos$),
        take(1),
        catchError(error => of(error))
      )
      .subscribe({
        next: (formFlows: FormFlow[]) => {
          this.formFlows$.next(formFlows);
          this.loading$.next(false);
        },
        error: error => {
          console.error(error);
        },
      });
  }

  public loadFormFlows(): void {
    this.formFlowDtos$
      .pipe(
        tap(() => {
          this.loading$.next(true);
        }),
        take(1)
      )
      .subscribe({
        next: (items: FormFlow[]) => {
          this.formFlows$.next(items);
          this.loading$.next(false);
        },
        error: error => {
          console.error(error);
        },
      });
  }

  public getFormFlow(key: string): Observable<Array<object>> {
    return this.http.get<Array<object>>(
      `${this.valtimoEndpointUri}v1/form-flow/${key}`
    );
  }

  public downloadFormFlowPermissions(formFlows: string[]): Observable<object[]> {
    return this.http.post<object[]>(`${this.valtimoEndpointUri}v1/download`, {formFlows});
  }

  public updateFormFlowPermissions(key: string, updatedPermission: object): Observable<object> {
    return this.http.put<object>(
      `${this.valtimoEndpointUri}v1/form-flow/${key}`,
      updatedPermission
    );
  }

  public updateFormFlow(key: string, request: FormFlow): Observable<object> {
    return this.http.put<object>(`${this.valtimoEndpointUri}v1/form-flow/${key}`, request);
  }
}
