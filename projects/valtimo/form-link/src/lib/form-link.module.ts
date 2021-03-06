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
import {FormLinkComponent} from './components/form-link/form-link.component';
import {FormLinkProcessDiagramComponent} from './components/form-link-process-diagram/form-link-process-diagram.component';
import {CommonModule} from '@angular/common';
import {FormLinkRoutingModule} from './form-link-routing.module';
import {FormsModule} from '@angular/forms';
import {FormLinkModalComponent} from './components/form-link-modal/form-link-modal.component';
import {ModalModule, SearchableDropdownSelectModule} from '@valtimo/components';
import {TranslateModule} from '@ngx-translate/core';
import {ProcessLinkComponent} from './components/process-link/process-link.component';
import {
  StepperModule,
  ModalModule as VModalModule,
  CardModule,
  ParagraphModule,
  ButtonModule,
  TitleModule,
} from '@valtimo/user-interface';
import {SelectPluginComponent} from './components/select-plugin/select-plugin.component';
import {SelectPluginConfigurationComponent} from './components/select-plugin-configuration/select-plugin-configuration.component';
import {SelectPluginFunctionComponent} from './components/select-plugin-function/select-plugin-function.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {PluginTranslatePipeModule, PluginConfigurationContainerModule} from '@valtimo/plugin';
import {PluginFunctionConfigurationComponent} from './components/plugin-function-configuration/plugin-function-configuration.component';

@NgModule({
  declarations: [
    FormLinkComponent,
    ProcessLinkComponent,
    FormLinkProcessDiagramComponent,
    FormLinkModalComponent,
    SelectPluginComponent,
    SelectPluginConfigurationComponent,
    SelectPluginFunctionComponent,
    PluginFunctionConfigurationComponent,
  ],
  imports: [
    CommonModule,
    FormLinkRoutingModule,
    FormsModule,
    ModalModule,
    SearchableDropdownSelectModule,
    TranslateModule,
    StepperModule,
    VModalModule,
    CardModule,
    FlexLayoutModule,
    PluginTranslatePipeModule,
    ParagraphModule,
    PluginConfigurationContainerModule,
    ButtonModule,
    TitleModule,
  ],
  exports: [
    FormLinkComponent,
    ProcessLinkComponent,
    SelectPluginComponent,
    SelectPluginConfigurationComponent,
    SelectPluginFunctionComponent,
    PluginFunctionConfigurationComponent,
  ],
})
export class FormLinkModule {}
