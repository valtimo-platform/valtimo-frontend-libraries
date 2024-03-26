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

import {Injectable} from '@angular/core';
import {StringTypeConverter} from './type-converters/stringTypeConverter';
import {TYPE_CONVERTERS, TypeConverter} from './type-converters/type-converters.model';

@Injectable({
  providedIn: 'root',
})
export class ViewContentService {
  private converters: {[key: string]: TypeConverter} = {};
  private defaultConverter: TypeConverter;

  constructor() {
    this.defaultConverter = new StringTypeConverter();

    TYPE_CONVERTERS.forEach(converter => this.addConverter(converter));
  }

  public get(value: any, definition: any) {
    const separator = ':';
    if (!definition.viewType) {
      definition.viewType = typeof value;
    }

    if (definition.viewType.includes(separator)) {
      // Get the substring of the string after the separator (:) and assign it to a new key
      definition.format = definition.viewType.slice(
        this.getSeparatorIndex(definition, separator) + 1
      );

      // Remove the substring after the separator and the separator from the string and assign it back to the viewType
      definition.viewType = definition.viewType.slice(
        0,
        this.getSeparatorIndex(definition, separator)
      );
    }

    if (typeof this.converters[definition.viewType] !== 'undefined') {
      return this.converters[definition.viewType].convert(value, definition);
    }

    return this.defaultConverter.convert(value, definition);
  }

  public addConverter(converter: TypeConverter) {
    if (typeof this.converters[converter.getTypeString()] !== 'undefined') {
      throw new Error('Converter with name ' + converter.getTypeString() + ' already exists');
    }

    this.converters[converter.getTypeString()] = converter;
  }

  getSeparatorIndex(definition, separator) {
    return definition.viewType.indexOf(separator);
  }
}
