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

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {DisplayComponent} from '../../../../models';
import {BigNumberDisplayTypeProperties} from '../../models';

@Component({
  selector: 'valtimo-big-number-display',
  templateUrl: './big-number-display.component.html',
  styleUrls: ['./big-number-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BigNumberDisplayComponent implements DisplayComponent {
  @Input() data: object;
  @Input() displayTypeProperties: BigNumberDisplayTypeProperties;
}