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

import {HttpClient} from '@angular/common/http';
import {BaseApiService, ConfigService} from '@valtimo/shared';
import {BasicWidget, IWidgetManagementService} from '@valtimo/widget';
import {BehaviorSubject, Observable, Subject, filter, of, switchMap, take, tap} from 'rxjs';
import {IkoManagementParams} from '../models';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IkoWidgetManagementApiService
  extends BaseApiService
  implements IWidgetManagementService<IkoManagementParams>
{
  public readonly params$ = new BehaviorSubject<IkoManagementParams | null>(null);
  public readonly valueResolverApi$ = new BehaviorSubject<string | null>('');

  constructor(
    protected override httpClient: HttpClient,
    protected override configService: ConfigService
  ) {
    super(httpClient, configService);
  }

  public initParams(serviceParams: IkoManagementParams): void {
    console.log({serviceParams});
    this.params$.next(serviceParams);
  }

  public getWidgetConfiguration(): Observable<BasicWidget[]> {
    return this.params$.pipe(
      filter((params: IkoManagementParams | null) => !!params),
      switchMap((params: IkoManagementParams | null) =>
        this.httpClient.get<BasicWidget[]>(
          this.getApiUrl(
            `/v1/iko-data-aggregate/${params?.aggregateKey}/tab/${params?.widgetTabKey}/widget`
          )
        )
      )
    );
  }

  public updateWidgetConfiguration(widget: BasicWidget[]): Observable<BasicWidget[]> {
    return this.params$.pipe(
      filter((params: IkoManagementParams | null) => !!params),
      switchMap((params: IkoManagementParams | null) =>
        this.httpClient.put<BasicWidget[]>(
          this.getApiUrl(
            `/v1/iko-data-aggregate/${params?.aggregateKey}/tab/${params?.widgetTabKey}/widget`
          ),
          widget
        )
      )
    );
  }

  public deleteWidget(widget: BasicWidget): Observable<void> {
    return this.params$.pipe(
      filter((params: IkoManagementParams | null) => !!params),
      switchMap((params: IkoManagementParams | null) =>
        this.httpClient.delete<void>(
          this.getApiUrl(
            `/v1/iko-data-aggregate/${params?.aggregateKey}/tab/${params?.tabKey}/widget/${widget.key}`
          )
        )
      )
    );
  }

  public updateWidget(widget: BasicWidget): Observable<BasicWidget> {
    return this.params$.pipe(
      filter((params: IkoManagementParams | null) => !!params),
      switchMap((params: IkoManagementParams | null) =>
        this.httpClient.put<BasicWidget>(
          this.getApiUrl(
            `/v1/iko-data-aggregate/${params?.aggregateKey}/tab/${params?.tabKey}/widget/${widget.key}`
          ),
          widget
        )
      )
    );
  }

  public createWidget(widget: BasicWidget): Observable<BasicWidget> {
    return this.params$.pipe(
      filter((params: IkoManagementParams | null) => !!params),
      switchMap((params: IkoManagementParams | null) =>
        this.httpClient.post<BasicWidget>(
          this.getApiUrl(
            `/v1/iko-data-aggregate/${params?.aggregateKey}/tab/${params?.tabKey}/widget/${widget.key}`
          ),
          widget
        )
      )
    );
  }
}
