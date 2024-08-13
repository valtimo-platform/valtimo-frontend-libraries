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

import {NgModule} from '@angular/core';
import {ProcessManagementComponent} from './process-management.component';
import {ProcessManagementRoutingModule} from './process-management-routing';
import {CommonModule} from '@angular/common';
import {ProcessManagementBuilderComponent} from './process-management-builder/process-management-builder.component';
import {ProcessManagementListComponent} from './process-management-list/process-management-list.component';
import {ListModule, WidgetModule} from '@valtimo/components';
import {FormsModule} from '@angular/forms';
import {ProcessManagementUploadComponent} from './process-management-upload/process-management-upload.component';
import {TranslateModule} from '@ngx-translate/core';
import { ProcessLinkModule } from '@valtimo/process-link';

@NgModule({
  declarations: [
    ProcessManagementComponent,
    ProcessManagementBuilderComponent,
    ProcessManagementListComponent,
    ProcessManagementUploadComponent,
  ],
  imports: [
    CommonModule,
    ProcessManagementRoutingModule,
    WidgetModule,
    ListModule,
    FormsModule,
    TranslateModule,
    ProcessLinkModule
  ],
  exports: [ProcessManagementComponent],
})
export class ProcessManagementModule {}
