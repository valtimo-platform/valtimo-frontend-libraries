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

import {Component, Input} from '@angular/core';
import {Objecttype} from '../../../../models/object-management.model';
import {Observable} from 'rxjs';

@Component({
  selector: 'valtimo-object-management-list-tab',
  templateUrl: './object-management-list-tab.component.html',
  styleUrls: ['./object-management-list-tab.component.scss'],
})
export class ObjectManagementListTabComponent {
  @Input() object$: Observable<Objecttype>;

  constructor() {}
}
