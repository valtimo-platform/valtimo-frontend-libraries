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
import {FormioModule} from '@formio/angular';
import {DropzoneModule, FileSizeModule} from '@valtimo/components';
import {TranslateModule} from '@ngx-translate/core';
import {DocumentModule} from '@valtimo/document';
import {ResourceModule} from '@valtimo/resource';
import {RouterModule} from '@angular/router';
import {DocumentenApiUploaderComponent} from './documenten-api-uploader/documenten-api-uploader.component';

@NgModule({
  imports: [
    CommonModule,
    FormioModule,
    DropzoneModule,
    TranslateModule,
    DocumentModule,
    FileSizeModule,
    ResourceModule,
    RouterModule,
  ],
  declarations: [DocumentenApiUploaderComponent],
  exports: [DocumentenApiUploaderComponent],
})
export class DocumentenApiFormioModule {}
