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

import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '@valtimo/components';
import {combineLatest, map, Observable, switchMap} from 'rxjs';
import {IkoManagementParams, IkoRepositoryConfigResponse} from '../../../../../models';
import {IkoManagementApiService} from '../../../../../services';

@Component({
  templateUrl: './iko-management-widget-details.component.html',
  styleUrl: './iko-management-widget-details.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class IkoManagementWidgetDetailsComponent implements OnInit, OnDestroy {
  public readonly params$: Observable<IkoManagementParams> = this.route.params.pipe(
    map((params: Params) => ({
      apiKey: params.apiKey,
      aggregateKey: params.key,
      actionKey: params.actionKey,
      tabKey: params.tabKey,
    }))
  );

  private readonly _ikoRepositoryConfig$: Observable<IkoRepositoryConfigResponse> =
    this.params$.pipe(
      switchMap((params: IkoManagementParams) =>
        this.ikoManagementApiService.getIkoRepositoryConfig(params.apiKey)
      )
    );

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly ikoManagementApiService: IkoManagementApiService,
    private readonly route: ActivatedRoute,
    private readonly translateService: TranslateService
  ) {}

  public ngOnDestroy(): void {
    this.breadcrumbService.clearThirdBreadcrumb();
    this.breadcrumbService.clearFourthBreadcrumb();
  }

  public ngOnInit(): void {
    this.setBreadcrumbs();
  }

  private setBreadcrumbs(): void {
    combineLatest([
      this._ikoRepositoryConfig$,
      this.params$,
      this.translateService.stream('key'),
    ]).subscribe(([repositoryConfig, params]) => {
      this.breadcrumbService.setThirdBreadcrumb({
        route: [`/iko-management/${repositoryConfig.key}`],
        content: repositoryConfig.title,
        href: `/iko-management/${repositoryConfig.key}`,
      });

      this.breadcrumbService.setFourthBreadcrumb({
        route: [`/iko-management/${repositoryConfig.key}/${params.aggregateKey}/${params.tabKey}`],
        content: this.translateService.instant('ikoManagement.tabs.title'),
        href: `/iko-management/${repositoryConfig.key}/${params.aggregateKey}/${params.tabKey}`,
      });
    });
  }
}
