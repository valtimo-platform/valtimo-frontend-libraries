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
import {DossierListService} from './dossier-list.service';
import {CaseStatusService, InternalCaseStatus} from '@valtimo/document';
import {DossierParameterService} from './dossier-parameter.service';
import {BehaviorSubject, combineLatest, map, Observable, switchMap, take, tap} from 'rxjs';

@Injectable()
export class DossierListStatusService {
  private readonly _selectedCaseStatuses$ = new BehaviorSubject<InternalCaseStatus[]>([]);

  private readonly _caseStatuses$: Observable<Array<InternalCaseStatus>> =
    this.dossierListService.documentDefinitionName$.pipe(
      switchMap(documentDefinitionName =>
        combineLatest([
          this.caseStatusService.getInternalCaseStatuses(documentDefinitionName),
          this.dossierParameterService.queryStatusParams$,
        ]).pipe(take(1))
      ),
      tap(([statuses, queryStatuses]) => {
        const selectedStatuses = queryStatuses
          ? statuses.filter(status => queryStatuses.includes(status.key))
          : statuses.filter(status => status.visibleInCaseListByDefault);
        this.setSelectedStatuses(selectedStatuses);
      }),
      map(([statuses]) => statuses)
    );

  public get caseStatuses$(): Observable<Array<InternalCaseStatus>> {
    return this._caseStatuses$;
  }

  public get selectedCaseStatuses$(): Observable<Array<InternalCaseStatus>> {
    return this._selectedCaseStatuses$;
  }

  constructor(
    private readonly dossierListService: DossierListService,
    private readonly caseStatusService: CaseStatusService,
    private readonly dossierParameterService: DossierParameterService
  ) {}

  public setSelectedStatuses(statuses: InternalCaseStatus[]): void {
    this._selectedCaseStatuses$.next(statuses);
    this.dossierParameterService.setStatusParameter(statuses.map(status => status.key));
  }
}
