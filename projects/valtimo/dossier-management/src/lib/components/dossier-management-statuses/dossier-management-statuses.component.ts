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

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CaseStatusService, InternalCaseStatus} from '@valtimo/document';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ActionItem, ViewType} from '@valtimo/components';
import {StatusModalCloseEvent, StatusModalType} from '../../models';

@Component({
  selector: 'valtimo-dossier-management-statuses',
  templateUrl: './dossier-management-statuses.component.html',
  styleUrls: ['./dossier-management-statuses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DossierManagementStatusesComponent {
  private readonly _reload$ = new BehaviorSubject<null>(null);

  private readonly _documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params?.name),
    filter(docDefName => !!docDefName)
  );

  public readonly loading$ = new BehaviorSubject<boolean>(true);

  public readonly usedKeys$ = new BehaviorSubject<string[]>([]);

  public readonly documentStatuses$ = combineLatest([
    this._documentDefinitionName$,
    this._reload$,
  ]).pipe(
    tap(() => this.loading$.next(true)),
    switchMap(([documentDefinitionName]) =>
      this.caseStatusService.getInternalCaseStatuses(documentDefinitionName)
    ),
    tap(statuses => {
      this.usedKeys$.next(statuses.map(status => status.key));
    }),
    tap(() => this.loading$.next(false))
  );

  public readonly FIELDS = [
    {
      key: 'title',
      label: 'dossierManagement.statuses.columns.title',
      viewType: ViewType.TEXT,
    },
    {
      key: 'key',
      label: 'dossierManagement.statuses.columns.key',
      viewType: ViewType.TEXT,
    },
    {
      key: 'visibleInCaseListByDefault',
      label: 'dossierManagement.statuses.columns.visible',
      viewType: ViewType.BOOLEAN,
    },
  ];

  public readonly ACTION_ITEMS: ActionItem[] = [
    {
      label: 'interface.edit',
      callback: this.openEditModal.bind(this),
      type: 'normal',
    },
    {
      label: 'interface.delete',
      callback: this.openDeleteModal.bind(this),
      type: 'danger',
    },
  ];

  public readonly statusModalType$ = new BehaviorSubject<StatusModalType>('closed');
  public readonly prefillStatus$ = new BehaviorSubject<InternalCaseStatus>(undefined);

  public readonly statusToDelete$ = new BehaviorSubject<InternalCaseStatus>(undefined);
  public readonly showDeleteModal$ = new Subject<boolean>();

  constructor(
    private readonly caseStatusService: CaseStatusService,
    private readonly route: ActivatedRoute
  ) {}

  public openDeleteModal(status: InternalCaseStatus): void {
    this.statusToDelete$.next(status);
    this.showDeleteModal$.next(true);
  }

  public openEditModal(status: InternalCaseStatus): void {
    this.prefillStatus$.next(status);
    this.statusModalType$.next('edit');
  }

  public openAddModal(): void {
    this.statusModalType$.next('add');
  }

  public closeModal(closeModalEvent: StatusModalCloseEvent): void {
    this.statusModalType$.next('closed');
  }

  public confirmDeleteStatus(status: InternalCaseStatus) {
    console.log(status);
  }
}
