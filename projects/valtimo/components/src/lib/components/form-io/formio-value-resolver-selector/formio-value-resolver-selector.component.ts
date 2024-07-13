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

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormioCustomComponent} from '../../../modules';
import {KeycloakService} from 'keycloak-angular';
import {KeycloakProfile} from 'keycloak-js';
import {CommonModule} from '@angular/common';
import {ValuePathSelectorComponent} from '../../value-path-selector/value-path-selector.component';

@Component({
  selector: 'valtimo-formio-value-resolver-selector',
  templateUrl: './formio-value-resolver-selector.component.html',
  styleUrls: ['./formio-value-resolver-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, ValuePathSelectorComponent],
})
export class FormioValueResolverSelectorComponent implements FormioCustomComponent<any> {
  @Input() value: any;
  @Input() disabled: boolean;
  @Output() valueChange = new EventEmitter<any>();

  constructor(private readonly keycloakService: KeycloakService) {
    this.keycloakService.loadUserProfile().then((profile: KeycloakProfile) => {
      this.value = profile;
      this.valueChange.emit();
    });
  }
}
