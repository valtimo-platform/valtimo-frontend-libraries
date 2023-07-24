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

import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {
  CARBON_CONSTANTS,
  CarbonTableConfig,
  ColumnType,
  createCarbonTableConfig,
} from '@valtimo/components';
import {BehaviorSubject, finalize, Observable, Subject, take} from 'rxjs';
import {ExportRoleOutput, Role} from '../../models';
import {AccessControlService} from '../../services/access-control.service';
import {Router} from '@angular/router';

@Component({
  templateUrl: './access-control-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessControlOverviewComponent implements OnInit {
  public readonly tableConfig: CarbonTableConfig = createCarbonTableConfig({
    fields: [
      {
        columnType: ColumnType.TEXT,
        fieldName: 'roleKey',
        translationKey: 'accessControl.roles.key',
      },
    ],
  });

  public readonly roles$: Observable<Role[]> = this.accessControlService.roles$;
  public readonly skeleton$ = new BehaviorSubject<boolean>(false);
  public readonly showAddModal$ = new BehaviorSubject<boolean>(false);
  public readonly showDeleteModal$ = new BehaviorSubject<boolean>(false);
  public readonly showExportModal$ = new BehaviorSubject<boolean>(false);
  public readonly selectedRowKeys$ = new BehaviorSubject<Array<string>>([]);
  public readonly resetExportType$ = new Subject<null>();
  public readonly exportDisabled$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly accessControlService: AccessControlService,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.accessControlService.loadRoles();
  }

  public openAddModal(): void {
    this.showAddModal$.next(true);
  }

  public onAdd(data: Role | null): void {
    this.showAddModal$.next(false);

    if (!data) {
      return;
    }

    this.accessControlService.dispatchAction(
      this.accessControlService.addRole(data).pipe(
        finalize(() => {
          this.showAddModal$.next(false);
        })
      )
    );
  }

  public showDeleteModal(): void {
    this.setSelectedRoleKeys();
    this.showDeleteModal$.next(true);
  }

  public showExportModal(): void {
    this.setSelectedRoleKeys();
    this.showExportModal$.next(true);
  }

  public closeExportModal(): void {
    this.showExportModal$.next(false);
  }

  public onDelete(roles: Array<string>): void {
    this.enableSkeleton();

    this.accessControlService.dispatchAction(
      this.accessControlService.deleteRoles({roles}).pipe(
        finalize(() => {
          this.disableSkeleton();
        })
      )
    );
  }

  public onExport(event: ExportRoleOutput): void {
    console.log('output', event);
    this.exportDisabled$.next(true);

    setTimeout(() => {
      this.resetExportType$.next(null);
      setTimeout(() => {
        this.exportDisabled$.next(false);
      }, CARBON_CONSTANTS.modalAnimationMs);
    }, 1000);
  }

  public onRowClick(role: Role): void {
    this.router.navigate([`/access-control/${role.roleKey}`]);
  }

  private enableSkeleton(): void {
    this.skeleton$.next(true);
  }

  private disableSkeleton(): void {
    this.skeleton$.next(false);
  }

  // remove when bulk actions are implemented
  private setSelectedRoleKeys(): void {
    this.roles$.pipe(take(1)).subscribe(roles => {
      this.selectedRowKeys$.next([
        roles[roles.length - 1].roleKey,
        roles[roles.length - 2].roleKey,
      ]);
    });
  }
}
