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
import {RightSidebarComponent} from './right-sidebar.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpLoaderFactory} from '@valtimo/config';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {
  GridModule,
  IconModule,
  SelectModule,
  StructuredListModule,
  TabsModule,
  ToggleModule,
  UIShellModule,
} from 'carbon-components-angular';

@NgModule({
  declarations: [RightSidebarComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgbTooltipModule,
    UIShellModule,
    IconModule,
    GridModule,
    TabsModule,
    StructuredListModule,
    SelectModule,
    ToggleModule,
  ],
  exports: [RightSidebarComponent],
})
export class RightSidebarModule {}
