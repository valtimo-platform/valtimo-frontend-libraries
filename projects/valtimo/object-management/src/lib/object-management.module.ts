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

import {NgModule} from '@angular/core';
import {ObjectManagementRoutingModule} from './object-management-routing.module';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {
  CarbonMultiInputModule,
  DropzoneModule,
  WidgetModule,
  ListModule,
  ConfirmationModalModule,
  SpinnerModule, ModalModule
} from '@valtimo/components';
import {ButtonModule, FormModule, InputModule as InputModule, ModalModule as VModalModule, SelectModule, TitleModule, TooltipIconModule} from '@valtimo/user-interface';
import {ObjectManagementDetailContainerComponent} from './components/object-management-detail-container/object-management-detail-container.component';
import {ObjectManagementDetailComponent} from './components/object-management-detail-container/tabs/object-management-detail/object-management-detail.component';
import {ObjectManagementListComponent} from './components/object-management-list/object-management-list.component';
import {ObjectManagementUploadModalComponent} from './components/object-management-upload-modal/object-management-upload-modal.component';
import {ObjectManagementModalComponent} from './components/object-management-modal/object-management-modal.component';
import {ObjectManagementListColumnsComponent} from './components/object-management-detail-container/tabs/object-management-list-columns/object-management-list-columns.component';
import {
  ButtonModule as CarbonButtonModule,
  CheckboxModule,
  DropdownModule,
  IconModule,
  InputModule as CarbonInputModule,
  LinkModule,
  LoadingModule,
  ModalModule as CarbonModalModule,
  NotificationModule,
} from 'carbon-components-angular';
import {ReactiveFormsModule} from '@angular/forms';
import {ObjectManagementSearchFieldsComponent} from './components/object-management-detail-container/tabs/object-management-search-fields/object-management-search-fields.component';

@NgModule({
  declarations: [
    ObjectManagementListComponent,
    ObjectManagementDetailContainerComponent,
    ObjectManagementDetailComponent,
    ObjectManagementListColumnsComponent,
    ObjectManagementModalComponent,
    ObjectManagementUploadModalComponent,
    ObjectManagementSearchFieldsComponent,
  ],
  imports: [
    CommonModule,
    DropzoneModule,
    WidgetModule,
    ListModule,
    TranslateModule,
    ObjectManagementRoutingModule,
    VModalModule,
    TitleModule,
    ButtonModule,
    FormModule,
    InputModule,
    SelectModule,
    CarbonInputModule,
    CarbonButtonModule,
    TooltipIconModule,
    CarbonMultiInputModule,
    CarbonModalModule,
    NotificationModule,
    LoadingModule,
    DropdownModule,
    CheckboxModule,
    LinkModule,
    IconModule,
    ReactiveFormsModule,
    ConfirmationModalModule,
    SpinnerModule,
    ModalModule
  ],
  exports: [],
})
export class ObjectManagementModule {}
