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
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {Observable} from 'rxjs';
import {CaseWidgetsRes} from '../models';
import {InterceptorSkip} from '@valtimo/security';
import {ActivatedRoute} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DossierWidgetsApiService extends BaseApiService {

  bsn: string = "";

  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService,
    protected readonly route: ActivatedRoute,
  ) {
    super(httpClient, configService);

    route.queryParamMap.subscribe((paramsMap) => {
      this.bsn = paramsMap.get("bsn");
    })
  }

  public getWidgetTabConfiguration(documentId: string, tabKey: string): Observable<CaseWidgetsRes> {
    return this.httpClient.get<CaseWidgetsRes>(
      this.getApiUrl(`v1/document/${documentId}/widget-tab/${tabKey}`)
    );
  }

  public getWidgetData(
    documentId: string,
    tabKey: string,
    widgetKey: string,
    queryParams?: string
  ): Observable<object> {
    if (queryParams) {
      queryParams += `&bsn=${this.bsn}`
    } else {
      queryParams = `bsn=${this.bsn}`
    }
    return this.httpClient.get<object>(
      this.getApiUrl(
        !queryParams
          ? `v1/document/${documentId}/widget-tab/${tabKey}/widget/${widgetKey}`
          : `v1/document/${documentId}/widget-tab/${tabKey}/widget/${widgetKey}?${queryParams}`
      ),
      {headers: new HttpHeaders().set(InterceptorSkip, '404')}
    );
  }
}
