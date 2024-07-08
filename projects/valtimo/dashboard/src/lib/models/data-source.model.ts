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

import {Type} from '@angular/core';
import {DataSourceConfigurationComponent} from './configuration.model';

interface DataSourceSpecification {
  dataSourceKey: string;
  configurationComponent?: Type<DataSourceConfigurationComponent>;
  translations: {
    [langKey: string]: {
      title: string;
      [translationKey: string]: string;
    };
  };
}

enum Operator {
  NOT_EQUAL_TO = '!=',
  EQUAL_TO = '==',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL_TO = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL_TO = '<=',
}

interface QueryCondition {
  queryPath: string;
  queryOperator: string;
  queryValue: string;
}

export {DataSourceSpecification, Operator, QueryCondition};
