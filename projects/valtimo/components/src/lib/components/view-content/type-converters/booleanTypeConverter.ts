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

import {TypeConverter} from './type-converters.model';

export class BooleanTypeConverter implements TypeConverter {
  getTypeString(): string {
    return 'boolean';
  }

  convert(value: any, definition: any): string {
    const enumeration = definition?.enum;

    if (enumeration && Array.isArray(enumeration) && enumeration.length > 1) {
      return value ? enumeration[0] || 'Yes' : enumeration[1] || 'No';
    } else if (
      enumeration &&
      typeof enumeration === 'object' &&
      Object.keys(enumeration).length > 1
    ) {
      return value
        ? enumeration[Object.keys(enumeration)[0]] || 'Yes'
        : enumeration[Object.keys(enumeration)[1]] || 'No';
    } else {
      return value ? 'Yes' : 'No';
    }
  }
}
