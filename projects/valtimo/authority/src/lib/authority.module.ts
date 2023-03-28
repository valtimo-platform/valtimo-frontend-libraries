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
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  AlertModule,
  FieldAutoFocusModule,
  ListModule,
  WidgetModule,
  SpinnerModule,
} from '@valtimo/components';
import {AuthorityRoutingModule} from './authority-routing.module';
import {AuthorityListComponent} from './authority-list/authority-list.component';
import {AuthorityDetailComponent} from './authority-detail/authority-detail.component';
import {AuthorityCreateComponent} from './authority-create/authority-create.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [AuthorityListComponent, AuthorityDetailComponent, AuthorityCreateComponent],
  imports: [
    CommonModule,
    AuthorityRoutingModule,
    ListModule,
    WidgetModule,
    FieldAutoFocusModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule,
    TranslateModule,
    SpinnerModule,
  ],
  exports: [],
})
export class AuthorityModule {}
