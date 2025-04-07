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
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Params, Router, RouterOutlet} from '@angular/router';
import {CARBON_CONSTANTS, PendingChangesComponent} from '@valtimo/components';
import {FormManagementCreateComponent} from '../form-management-create';
import {FormManagementListComponent} from '../form-management-list';
import {ButtonModule} from 'carbon-components-angular';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {ManagementContext} from '@valtimo/config';
import {FormManagementEditComponent} from '../form-management-edit';
import {TranslateService} from '@ngx-translate/core';
import {GlobalNotificationService} from '@valtimo/layout';

@Component({
  templateUrl: './form-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FormManagementListComponent,
    FormManagementCreateComponent,
    FormManagementEditComponent,
    RouterOutlet,
  ],
})
export class FormManagementComponent extends PendingChangesComponent {
  public readonly hasCreateQueryParam$: Observable<boolean> = this.route.queryParamMap.pipe(
    map(params => params.has('create') && params.get('create') === 'true')
  );

  public readonly editQueryParam$: Observable<string | null> = this.route.queryParamMap.pipe(
    map(params => (params.has('edit') ? params.get('edit') : null))
  );

  public readonly hasEditParam$: Observable<boolean> = this.route.paramMap.pipe(
    map(params => params.has('formDefinitionId'))
  );

  public readonly context$: Observable<ManagementContext | ''> = this.route.data.pipe(
    map(data => data && (data['context'] as ManagementContext))
  );

  public readonly create$ = new BehaviorSubject<boolean>(false);
  public readonly upload$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,

    private readonly notificationService: GlobalNotificationService,
    private readonly translateService: TranslateService
  ) {
    super();
  }

  public onNavigateToCreateEvent(): void {
    this.create$.next(true);
  }

  public onGoBackFromCreateEvent(): void {
    this.create$.next(false);
    this.upload$.next(false);
  }

  public onGoBackEvent(): void {
    if (!this.pendingChanges) {
      this.updateQueryParams({}, ['create', 'edit', 'upload']);
    } else {
      const canDeactivate = this.canDeactivate() as Observable<boolean>;
      const isObservable = !!canDeactivate?.subscribe;
      isObservable &&
        canDeactivate.subscribe(navigateAway => {
          if (navigateAway) this.updateQueryParams({}, ['create', 'edit', 'upload']);
        });
    }
  }

  public onFormDefinitionEditEvent(formDefinitionId: string, upload = false): void {
    this.router.navigate([formDefinitionId], {
      relativeTo: this.route,
      queryParams: {...(upload && {upload: true})},
    });
  }

  public onFormDefinitionCreateEvent(formDefinitionId: string): void {
    this.resetNotifications();

    this.notificationService.showToast({
      type: 'success',
      duration: CARBON_CONSTANTS.notificationDuration,
      showClose: true,
      title: this.translateService.instant('formManagement.notifications.created'),
    });

    this.onFormDefinitionEditEvent(formDefinitionId);
  }

  public onFormDefinitionUploadEvent(formDefinitionId: string): void {
    this.resetNotifications();

    this.notificationService.showToast({
      type: 'success',
      duration: CARBON_CONSTANTS.notificationDuration,
      showClose: true,
      title: this.translateService.instant('formManagement.notifications.created'),
    });

    this.onFormDefinitionEditEvent(formDefinitionId, true);
  }

  public onNavigateToUploadEvent(): void {
    this.create$.next(true);
    this.upload$.next(true);
  }

  public onModifiedEvent(isDelete = false): void {
    this.onDeactivatePendingChanges();
    this.updateQueryParams({}, ['create', 'edit', 'upload']);
    this.resetNotifications();
    this.notificationService.showToast({
      type: 'success',
      duration: CARBON_CONSTANTS.notificationDuration,
      showClose: true,
      title: isDelete
        ? this.translateService.instant('formManagement.notifications.deleted')
        : this.translateService.instant('formManagement.notifications.deployed'),
    });
  }

  public onPendingChangesChangeEvent(event: boolean): void {
    if (event) {
      this.onActivatePendingChanges();
    } else {
      this.onDeactivatePendingChanges();
    }
  }

  public onDeleteErrorEvent(): void {
    this.resetNotifications();
    this.notificationService.showToast({
      type: 'error',
      duration: CARBON_CONSTANTS.notificationDuration,
      showClose: true,
      title: this.translateService.instant('formManagement.notifications.deletionError'),
    });
  }

  public onDeployErrorEvent(): void {
    this.resetNotifications();
    this.notificationService.showToast({
      type: 'error',
      duration: CARBON_CONSTANTS.notificationDuration,
      showClose: true,
      title: this.translateService.instant('formManagement.notifications.deploymentError'),
    });
  }

  private onActivatePendingChanges(): void {
    this.pendingChanges = true;
  }

  private onDeactivatePendingChanges(): void {
    this.pendingChanges = false;
  }

  private updateQueryParams(addParams: Params, removeParams: string[] = []): void {
    const clearedParams = removeParams.reduce((acc, curr) => ({...acc, [curr]: null}), {});
    const mergedParams = {...clearedParams, ...addParams};
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: mergedParams,
      queryParamsHandling: 'merge',
    });
  }

  private resetNotifications(): void {
    this.notificationService
      ?.getNotificationRefs()
      .forEach(ref => this.notificationService.close(ref));
  }
}
