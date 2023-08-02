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

import {Component, Input, OnChanges, OnInit, ViewEncapsulation} from '@angular/core';
import {ListItem, NotificationService} from 'carbon-components-angular';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {DashboardItem} from '../../models';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CARBON_CONSTANTS} from '@valtimo/components';

@Component({
  selector: 'valtimo-edit-dashboard-modal',
  templateUrl: './edit-dashboard-modal.html',
  styleUrls: ['./edit-dashboard-modal.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NotificationService],
})
export class EditDashboardModalComponent implements OnInit, OnChanges {
  @Input() public showModal$: Observable<boolean>;
  @Input() public dashboard: DashboardItem;

  public readonly open$ = new BehaviorSubject<boolean>(false);

  public editDashboardForm!: FormGroup;

  public get dashboardTitle() {
    return this.editDashboardForm.get('title');
  }

  public get dashboardDescription() {
    return this.editDashboardForm.get('description');
  }

  public get dashboardRoles() {
    return this.editDashboardForm.get('roles');
  }

  public readonly roleItems$ = new BehaviorSubject<Array<ListItem>>([
    {content: 'ROLE_ADMIN', selected: false},
    {content: 'ROLE_USER', selected: false},
    {content: 'ROLE_DEVELOPER', selected: false},
  ]);

  private _openSubscription!: Subscription;

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.openOpenSubscription();
    this.setEditDashboardForm();
  }

  public ngOnChanges(): void {
    this.setEditDashboardForm();
  }

  public closeModal(): void {
    this.open$.next(false);

    setTimeout(() => {
      this.editDashboardForm.reset();
    }, CARBON_CONSTANTS.modalAnimationMs);
  }

  public saveDashboard(): void {}

  private setEditDashboardForm(): void {
    this.editDashboardForm = this.fb.group({
      title: this.fb.control('', [Validators.required]),
      description: this.fb.control('', [Validators.required]),
      roles: this.fb.control([], [Validators.required]),
    });

    this.dashboardTitle?.setValue(this.dashboard.title);
    this.dashboardDescription?.setValue(this.dashboard.description);
    this.dashboardRoles?.setValue(this.dashboard.roles);
  }

  private openOpenSubscription(): void {
    this._openSubscription = this.showModal$.subscribe(show => {
      this.open$.next(show);
    });
  }
}
