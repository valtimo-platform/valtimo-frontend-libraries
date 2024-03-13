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

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {CARBON_THEME, CarbonListModule} from '@valtimo/components';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {TabsModule} from 'carbon-components-angular';
import {TaskManagementService} from '../../services';

@Component({
  selector: 'valtimo-task-management-column-modal',
  templateUrl: './task-management-column-modal.component.html',
  styleUrls: ['./task-management-column-modal.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CarbonListModule, TranslateModule, TabsModule],
  providers: [TaskManagementService],
})
export class TaskManagementColumnModalComponent {
  @Input() public carbonTheme: CARBON_THEME = CARBON_THEME.G10;
}
