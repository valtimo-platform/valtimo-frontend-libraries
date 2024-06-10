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

import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {DropdownModule, InputModule, SelectModule} from 'carbon-components-angular';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  templateUrl: './dossier-management-widget-collection.component.html',
  styleUrls: ['./dossier-management-widget-collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputModule,
    ReactiveFormsModule,
    SelectModule,
    DropdownModule,
  ],
})
export class DossierManagementWidgetCollectionComponent {
  @Output() public readonly changeValidEvent = new EventEmitter<boolean>();
}
