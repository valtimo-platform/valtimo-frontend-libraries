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
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  BaseApiService,
  ConfigService,
} from '@valtimo/config';
import {InterceptorSkip} from '@valtimo/security';

@Injectable({providedIn: 'root'})
export class ViewModelService extends BaseApiService {
  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
  }

  public getViewModel(formName: string, taskInstanceId: string): Observable<any> {
    return this.httpClient.get<any>(this.getApiUrl('/v1/form/view-model'), {
      params: {
        formName,
        taskInstanceId
      },
      headers: new HttpHeaders().set(InterceptorSkip, '400')
    });
  }

  public updateViewModel(formName: string, taskInstanceId: string, viewModel: any): Observable<any> {
    return this.httpClient.post(
      this.getApiUrl(`/v1/form/view-model`),
      viewModel,
      {
        params: {
          formName,
          taskInstanceId
        },
        headers: new HttpHeaders().set(InterceptorSkip, '400')
      });
  }

  public submitViewModel(formName: string, taskInstanceId: string, viewModel: any): Observable<any> {
    return this.httpClient.post(
      this.getApiUrl(`/v1/form/view-model/submit`),
      viewModel,
      {
        params: {
          formName,
          taskInstanceId
        },
        headers: new HttpHeaders().set(InterceptorSkip, '400')
      });
  }
}
