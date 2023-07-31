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

import {Observable} from 'rxjs';
import {EventEmitter} from '@angular/core';

interface ConfigurationComponent {
  save$: Observable<void>;
  disabled$: Observable<boolean>;
  valid: EventEmitter<boolean>;
  prefillConfiguration$?: Observable<object>;
  configuration: EventEmitter<object>;
}

interface DisplayTypeConfigurationComponent extends ConfigurationComponent {
  displayTypeKey: string;
}

interface DataSourceConfigurationComponent extends ConfigurationComponent {
  dataSourceKey: string;
}

export {
  ConfigurationComponent,
  DisplayTypeConfigurationComponent,
  DataSourceConfigurationComponent,
};