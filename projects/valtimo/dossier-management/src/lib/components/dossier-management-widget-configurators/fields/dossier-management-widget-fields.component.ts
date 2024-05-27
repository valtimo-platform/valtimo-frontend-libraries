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

import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {ButtonModule} from 'carbon-components-angular';
import {WidgetContentComponent} from '../../../models';

interface FieldTest {
  test: string;
}

@Component({
  selector: 'valtimo-dossier-management-widget-fields',
  templateUrl: './dossier-management-widget-fields.component.html',
  styleUrls: ['./dossier-management-widget-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonModule],
})
export class DossierManagementWidgetFieldsComponent implements WidgetContentComponent {
  @Input({required: true}) public columnData: FieldTest;
  @Output() public changeEvent = new EventEmitter<FieldTest>();
}
