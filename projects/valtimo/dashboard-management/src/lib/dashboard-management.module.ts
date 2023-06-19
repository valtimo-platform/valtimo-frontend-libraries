/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
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
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {CarbonTableModule, ListModule, SpinnerModule} from '@valtimo/components';
import {ButtonModule, DropdownModule, InputModule, ModalModule} from 'carbon-components-angular';
import {DashboardDetailsComponent} from './components/dashboard-details/dashboard-details.component';
import {DashboardManagementComponent} from './components/dashboard-management/dashboard-management.component';
import {DashboardManagementRoutingModule} from './dashboard-management-routing.module';
import {AddModule, ArrowDownModule, ArrowUpModule} from '@carbon/icons-angular';
import {WidgetModalComponent} from './components/widget-modal/widget-modal.component';

@NgModule({
  declarations: [DashboardManagementComponent, DashboardDetailsComponent, WidgetModalComponent],
  imports: [
    ButtonModule,
    CarbonTableModule,
    CommonModule,
    DashboardManagementRoutingModule,
    DropdownModule,
    InputModule,
    ListModule,
    ModalModule,
    ReactiveFormsModule,
    SpinnerModule,
    TranslateModule,
    ArrowUpModule,
    ArrowDownModule,
    AddModule,
  ],
  exports: [],
})
export class DashboardManagementModule {}
