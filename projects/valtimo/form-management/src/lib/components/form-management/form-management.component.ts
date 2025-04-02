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
import {ActivatedRoute, Params, Router} from '@angular/router';
import {CARBON_CONSTANTS, PendingChangesComponent} from '@valtimo/components';
import {FormManagementCreateComponent} from '../form-management-create';
import {FormManagementListComponent} from '../form-management-list';
import {ButtonModule, NotificationService} from 'carbon-components-angular';
import {map, Observable} from 'rxjs';
import {ManagementContext} from '@valtimo/config';
import {FormManagementEditComponent} from '../form-management-edit';
import {TranslateService} from '@ngx-translate/core';

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
  ],
  providers: [NotificationService],
})
export class FormManagementComponent extends PendingChangesComponent {
  public readonly hasCreateQueryParam$: Observable<boolean> = this.route.queryParamMap.pipe(
    map(params => params.has('create') && params.get('create') === 'true')
  );

  public readonly editQueryParam$: Observable<string | null> = this.route.queryParamMap.pipe(
    map(params => (params.has('edit') ? params.get('edit') : null))
  );

  public readonly context$: Observable<ManagementContext | ''> = this.route.data.pipe(
    map(data => data && (data['context'] as ManagementContext))
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly translateService: TranslateService
  ) {
    super();
  }

  public onNavigateToCreateEvent(): void {
    this.addQueryParams({create: true});
  }

  public onNavigateToUploadEvent(): void {
    this.addQueryParams({create: true, upload: true});
  }

  public onGoBackFromCreateEvent(): void {
    this.removeQueryParams(['create']);
  }

  public onPendingChangesChangeEvent(event: boolean): void {
    if (event) {
      this.onActivatePendingChanges();
    } else {
      this.onDeactivatePendingChanges();
    }
  }

  public onFormDefinitionCreateEvent(formDefinitionId: string): void {
    this.resetNotifications();

    this.notificationService.showToast({
      type: 'success',
      duration: CARBON_CONSTANTS.notificationDuration,
      showClose: true,
      title: this.translateService.instant('formManagement.notifications.created'),
    });

    this.removeQueryParams(['create']);
    setTimeout(() => this.addQueryParams({edit: formDefinitionId}));
  }

  public onFormDefinitionUploadEvent(formDefinitionId: string): void {
    this.resetNotifications();

    this.notificationService.showToast({
      type: 'success',
      duration: CARBON_CONSTANTS.notificationDuration,
      showClose: true,
      title: this.translateService.instant('formManagement.notifications.created'),
    });

    this.removeQueryParams(['create']);
    setTimeout(() => this.addQueryParams({edit: formDefinitionId, upload: true}));
  }

  public onFormDefinitionEditEvent(formDefinitionId: string): void {
    this.removeQueryParams(['create']);
    setTimeout(() => this.addQueryParams({edit: formDefinitionId}));
  }

  public onModifiedEvent(isDelete = false): void {
    this.onDeactivatePendingChanges();
    this.removeQueryParams(['create', 'edit', 'upload']);

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

  public onGoBackEvent(): void {
    if (!this.pendingChanges) {
      this.removeQueryParams(['create', 'edit', 'upload']);
    } else {
      const canDeactivate = this.canDeactivate() as Observable<boolean>;
      const isObservable = !!canDeactivate?.subscribe;

      isObservable &&
        canDeactivate.subscribe(navigateAway => {
          if (navigateAway) this.removeQueryParams(['create', 'edit', 'upload']);
        });
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

  private removeQueryParams(params: string[]): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params.reduce((acc, curr) => ({...acc, [curr]: null}), {}),
      queryParamsHandling: 'merge',
    });
  }

  private addQueryParams(queryParams: Params): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  private resetNotifications(): void {
    this.notificationService.notificationRefs.forEach(ref => this.notificationService.close(ref));
  }
}
