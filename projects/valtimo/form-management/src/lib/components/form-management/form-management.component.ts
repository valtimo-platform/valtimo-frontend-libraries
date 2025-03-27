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
import {ActivatedRoute, Router} from '@angular/router';
import {PendingChangesComponent} from '@valtimo/components';
import {FormManagementCreateComponent} from '../form-management-create';
import {FormManagementListComponent} from '../form-management-list';
import {ButtonModule} from 'carbon-components-angular';
import {map, Observable} from 'rxjs';
import {ManagementContext} from '@valtimo/config';
import {FormManagementEditComponent} from '../form-management-edit';

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
    private readonly router: Router
  ) {
    super();
  }

  public onNavigateToCreateEvent(): void {
    this.addCreateQueryParams();
  }

  public onGoBackFromCreateEvent(): void {
    this.removeCreateQueryParams();
  }

  //TODO Check for changes in process
  public onActivatePendingChanges(): void {
    this.pendingChanges = true;
  }

  public onDeactivatePendingChanges(): void {
    this.pendingChanges = false;
  }

  public onFormDefinitionEditEvent(formDefinitionId: string): void {
    this.removeCreateQueryParams();
    this.addEditQueryParams(formDefinitionId);
  }

  public onFormDefinitionDeleteEvent(): void {
    this.removeCreateQueryParams();
    this.removeEditQueryParams();
  }

  private addCreateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {create: true},
      queryParamsHandling: 'merge',
    });
  }

  private removeCreateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {create: null},
      queryParamsHandling: 'merge',
    });
  }

  private addEditQueryParams(formDefinitionId: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {edit: formDefinitionId},
      queryParamsHandling: 'merge',
    });
  }

  private removeEditQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {edit: null},
      queryParamsHandling: 'merge',
    });
  }
}
