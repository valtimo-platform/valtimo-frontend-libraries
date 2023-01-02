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

import { NgModule } from '@angular/core';
import {ObjectManagementRoutingModule} from './object-management-routing.module';
import {ObjecttypesManagementComponent} from './components/objecttypes-management/objecttypes-management.component';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {WidgetModule, ListModule} from '@valtimo/components'
import {ObjecttypeAddModalComponent} from './components/objecttype-add-modal/objecttype-add-modal.component';
import {ButtonModule, FormModule, InputModule, ModalModule, SelectModule, TitleModule} from '@valtimo/user-interface';

@NgModule({
  declarations: [
    ObjecttypesManagementComponent,
    ObjecttypeAddModalComponent
  ],
  imports: [
    CommonModule,
    WidgetModule,
    ListModule,
    TranslateModule,
    ObjectManagementRoutingModule,
    ModalModule,
    TitleModule,
    ButtonModule,
    FormModule,
    InputModule,
    SelectModule
  ],
  exports: []
})
export class ObjectManagementModule { }
