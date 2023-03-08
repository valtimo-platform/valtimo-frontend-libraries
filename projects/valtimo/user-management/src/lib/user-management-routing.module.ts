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

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthGuardService} from '@valtimo/security';
import {UserListComponent} from './user-list/user-list.component';
import {UserDetailComponent} from './user-detail/user-detail.component';
import {UserCreateComponent} from './user-create/user-create.component';
import {ROLE_ADMIN} from '@valtimo/config';

const routes: Routes = [
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [AuthGuardService],
    data: {title: 'Users', roles: [ROLE_ADMIN]},
  },
  {
    path: 'users/create',
    component: UserCreateComponent,
    canActivate: [AuthGuardService],
    data: {title: 'Create new User', roles: [ROLE_ADMIN]},
  },
  {
    path: 'users/user/:id',
    component: UserDetailComponent,
    canActivate: [AuthGuardService],
    data: {title: 'User details', roles: [ROLE_ADMIN]},
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule {}
