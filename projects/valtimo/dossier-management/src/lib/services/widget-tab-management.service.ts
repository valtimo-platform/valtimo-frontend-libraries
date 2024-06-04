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
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigService} from '@valtimo/config';
import {Observable} from 'rxjs';

import {WidgetTabConfiguration} from '../models/widget-tab-item.type';
import {ApiTabType} from '@valtimo/dossier';

@Injectable({
  providedIn: 'root',
})
export class WidgetTabManagementService {
  private readonly valtimoEndpointUri: string;

  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigService
  ) {
    this.valtimoEndpointUri = `${this.configService.config.valtimoApi.endpointUri}`;
  }

  public getWidgetTabConfiguration(
    caseDefinitionName: string,
    widgetTabKey: string
  ): Observable<WidgetTabConfiguration> {
    return this.http.get<WidgetTabConfiguration>(
      `${this.valtimoEndpointUri}management/v1/case-definition/${caseDefinitionName}/widget-tab/${widgetTabKey}`
    );
  }

  public updateWidgetTab(tab: WidgetTabConfiguration): Observable<WidgetTabConfiguration> {
    // if (tab.name === '') {
    //   delete tab.name;
    // }

    return this.http.put<WidgetTabConfiguration>(
      `${this.valtimoEndpointUri}management/v1/case-definition/${tab.caseDefinitionName}/tab/${tab.key}`,
      {...tab, contentKey: '-', type: ApiTabType.WIDGETS}
    );
  }

  public updateWidgets(tab: WidgetTabConfiguration): Observable<any> {
    return this.http.post<any>(
      `${this.valtimoEndpointUri}management/v1/case-definition/${tab.caseDefinitionName}/widget-tab/${tab.key}`,
      tab
    );
  }
}
