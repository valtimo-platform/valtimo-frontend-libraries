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

import {ExtendedComponentSchema, ValidateOptions} from '@formio/angular';
import {EventEmitter} from '@angular/core';
import {NgElement, WithProperties} from '@angular/elements';

// Custom Angular Components
export interface FormioCustomComponentInfo {
  type: string;
  selector: string;
  emptyValue?: any;
  extraValidators?: (keyof ValidateOptions)[];
  fieldOptions?: string[];
  template?: string;
  changeEvent?: string; // Default: valueChange
  editForm?: () => {components: ExtendedComponentSchema[]};
  title?: string;
  group?: string;
  icon?: string;
  schema?: object;
}

export type FormioCustomElement = NgElement &
  WithProperties<{value: any} & ExtendedComponentSchema>;

export interface FormioEvent {
  eventName: string;
  data?: {
    [key: string]: any;
  };
}

export interface FormioCustomComponent<T> {
  value: T; // Should be an @Input
  valueChange: EventEmitter<T>; // Should be an @Output
  disabled: boolean;
  formioEvent?: EventEmitter<FormioEvent>; // Should be an @Output
}
