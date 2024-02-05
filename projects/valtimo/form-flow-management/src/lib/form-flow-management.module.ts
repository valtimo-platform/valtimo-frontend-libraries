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
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {
  CarbonListModule,
  ConfirmationModalModule,
  EditorModule,
  RenderInPageHeaderDirectiveModule,
} from '@valtimo/components';
import {FormFlowManagementRoutingModule} from './form-flow-management-routing.module';
import {FormFlowOverviewComponent} from './components/overview/form-flow-overview.component';
import {FormFlowMetadataModalComponent} from './components/form-flow-metadata-modal/form-flow-metadata-modal.component';
import {
  ButtonModule,
  DialogModule,
  IconModule,
  InputModule,
  LoadingModule,
  ModalModule,
  NotificationModule,
} from 'carbon-components-angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormFlowEditorComponent} from './components/editor/form-flow-editor.component';
import {DeleteFormFlowModalComponent} from './components/delete-form-flow-modal/delete-form-flow-modal.component';
import {DownloadFormFlowModalComponent} from './components/download-form-flow-modal/download-form-flow-modal.component';

@NgModule({
  declarations: [
    FormFlowOverviewComponent,
    FormFlowMetadataModalComponent,
    FormFlowEditorComponent,
    DeleteFormFlowModalComponent,
    DownloadFormFlowModalComponent,
  ],
  imports: [
    CommonModule,
    FormFlowManagementRoutingModule,
    ButtonModule,
    FormsModule,
    ModalModule,
    TranslateModule,
    ReactiveFormsModule,
    InputModule,
    IconModule,
    ConfirmationModalModule,
    EditorModule,
    RenderInPageHeaderDirectiveModule,
    LoadingModule,
    IconModule,
    DialogModule,
    NotificationModule,
    CarbonListModule,
  ],
})
export class FormFlowManagementModule {}
