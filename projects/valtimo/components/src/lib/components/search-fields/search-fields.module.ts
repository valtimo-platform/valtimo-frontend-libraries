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
import {CommonModule} from '@angular/common';
import {SearchFieldsComponent} from './search-fields.component';
import {SpinnerModule} from '../spinner/spinner.module';
import {WidgetModule} from '../widget/widget.module';
import {TranslateModule} from '@ngx-translate/core';
import {
  ButtonModule,
  DatePickerModule,
  FormModule,
  InputLabelModule,
  InputModule,
  ParagraphModule,
  SelectModule,
} from '@valtimo/user-interface';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [SearchFieldsComponent],
  imports: [
    CommonModule,
    SpinnerModule,
    WidgetModule,
    TranslateModule,
    InputModule,
    FormModule,
    DatePickerModule,
    InputLabelModule,
    ParagraphModule,
    ButtonModule,
    SelectModule,
    FormsModule,
  ],
  exports: [SearchFieldsComponent],
})
export class SearchFieldsModule {}
