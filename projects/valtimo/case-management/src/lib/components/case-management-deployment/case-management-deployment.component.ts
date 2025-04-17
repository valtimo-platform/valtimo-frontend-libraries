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

import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {IconService} from 'carbon-components-angular';
import {Return16, Save16, TrashCan16} from '@carbon/icons';
import {combineLatest, map, Observable, switchMap} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {CaseManagementService} from '../../services';
import {tap} from 'rxjs/operators';
import {CaseDeploymentData} from '../../models/case-deployment.model';

@Component({
  templateUrl: './case-management-deployment.component.html',
  styleUrls: ['./case-management-deployment.component.scss'],
})
export class CaseManagementDeploymentComponent {
  public readonly params$: Observable<{
    caseDefinitionKey: string;
    caseDefinitionVersionTag: string;
  }> = this.route.params.pipe(
    map(({caseDefinitionKey, caseDefinitionVersionTag}) => ({
      caseDefinitionKey: caseDefinitionKey,
      caseDefinitionVersionTag: caseDefinitionVersionTag,
    }))
  );

  public readonly caseDefinitionKey$: Observable<string> = this.params$.pipe(
    map(params => params.caseDefinitionKey || '')
  );

  public readonly caseDefinitionVersionTag$: Observable<string> = this.params$.pipe(
    map(params => params.caseDefinitionVersionTag || ''),
    tap(result => console.log('caseDefinitionVersionTag$ ', result))
  );

  public readonly caseDeploymentData$: Observable<CaseDeploymentData> = combineLatest([
    this.caseDefinitionKey$,
    this.caseDefinitionVersionTag$,
  ]).pipe(
    switchMap(([caseDefinitionKey, caseDefinitionVersionTag]) =>
      this.caseManagementService.getCaseDefinition(caseDefinitionKey, caseDefinitionVersionTag)
    )
  );

  public readonly releaseVersionEntries$: Observable<{key: string; value: string}[]> =
    this.caseDeploymentData$.pipe(
      map(caseDeploymentData => {
        const releaseVersionData = {
          caseDefinitionVersionTag: caseDeploymentData.caseDefinitionVersionTag ?? '-',
          basedOnVersionTag: caseDeploymentData.basedOnVersionTag ?? '-',
        };

        return Object.entries(releaseVersionData).map(([key, value]) => ({key, value}));
      })
    );

  public readonly releaseInformationDataEntries$: Observable<
    {key: string; value: string | Date}[]
  > = this.caseDeploymentData$.pipe(
    map(caseDeploymentData => {
      const releaseInformationData = {
        createdBy: caseDeploymentData.createdBy ?? '-',
        createdDate: caseDeploymentData.createdDate ?? new Date(),
        description: caseDeploymentData.description ?? '-',
      };

      return Object.entries(releaseInformationData).map(([key, value]) => ({key, value}));
    })
  );

  constructor(
    private readonly caseManagementService: CaseManagementService,
    private readonly iconService: IconService,
    private readonly translateService: TranslateService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.iconService.register(Return16);
    this.iconService.register(TrashCan16);
    this.iconService.register(Save16);
  }

  public goBack(): void {
    combineLatest([this.caseDefinitionKey$, this.caseDefinitionVersionTag$])
      .pipe(
        tap(([caseDefinitionKey, caseDefinitionVersionTag]) => {
          this.router.navigate([
            '/case-management/case',
            caseDefinitionKey,
            'version',
            caseDefinitionVersionTag,
          ]);
        })
      )
      .subscribe();
  }
}
