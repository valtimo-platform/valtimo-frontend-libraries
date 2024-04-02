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
import {CommonModule} from '@angular/common';
import {DATA_SOURCE_TOKEN} from '../../constants';
import {caseCountDataSourceSpecification} from './case-count.specification';
import {CaseCountConfigurationComponent} from './components';
import {ReactiveFormsModule} from '@angular/forms';
import {WidgetTranslatePipeModule} from '../../pipes';
import {DropdownModule, InputModule} from 'carbon-components-angular';
import {CarbonMultiInputModule} from '@valtimo/components';

@NgModule({
  declarations: [CaseCountConfigurationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WidgetTranslatePipeModule,
    InputModule,
    DropdownModule,
    CarbonMultiInputModule,
  ],
  exports: [CaseCountConfigurationComponent],
  providers: [
    {provide: DATA_SOURCE_TOKEN, useValue: caseCountDataSourceSpecification, multi: true},
  ],
})
export class CaseCountDataSourceModule {}
