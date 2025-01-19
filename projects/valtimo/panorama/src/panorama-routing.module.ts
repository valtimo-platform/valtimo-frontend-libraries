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
import {ROLE_USER} from '@valtimo/config';
import {AuthGuardService} from '@valtimo/security';
import {ClientDetailsComponent} from './lib/components/client-details/client-details.component';
import {ClientListComponent} from './lib/components/client-list/client-list.component';

const routes: Routes = [
  {
    path: 'panorama',
    component: ClientListComponent,
    canActivate: [AuthGuardService],
    data: {title: 'Klantbeeld', roles: [ROLE_USER]},
  },
  {
    path: 'panorama/:bsn',
    component: ClientDetailsComponent,
    canActivate: [AuthGuardService],
    data: {title: 'Client details', roles: [ROLE_USER], customPageTitle: true},
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class PanoramaRoutingModule {}
