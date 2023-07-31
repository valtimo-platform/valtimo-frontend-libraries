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

import {Type} from '@angular/core';
import {DisplayTypeConfigurationComponent} from './configuration.model';

interface DisplayComponent {
  displayTypeKey: string;
  displayTypeProperties: object;
  data: object;
}

interface DisplayTypeSpecification {
  displayTypeKey: string;
  displayComponent: Type<DisplayComponent>;
  configurationComponent?: Type<DisplayTypeConfigurationComponent>;
  supportedSizes: ['1x1'];
  translations: {
    [langKey: string]: {
      [translationKey: string]: string;
    };
  };
}

export {DisplayComponent, DisplayTypeSpecification};
