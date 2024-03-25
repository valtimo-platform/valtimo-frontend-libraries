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

import {Injectable} from '@angular/core';
import {ExtendedComponentSchema, FormioForm} from '@formio/angular';

@Injectable({
  providedIn: 'root',
})
export class FormMappingService {
  mapComponents(
    form: FormioForm,
    mappingFunction: (component: ExtendedComponentSchema) => ExtendedComponentSchema
  ): FormioForm {
    const recursiveMappingFunction = (component: ExtendedComponentSchema) => {
      const mappedComponent = mappingFunction(component);
      const innerComponents = component.components;
      const isColumns = component?.type === 'columns' && component.columns;

      if (innerComponents && innerComponents.length > 0) {
        return {
          ...mappedComponent,
          components: innerComponents.map((innerComponent: ExtendedComponentSchema) =>
            recursiveMappingFunction(innerComponent)
          ),
        };
      }

      if (isColumns) {
        return {
          ...component,
          columns: component.columns.map((column: any) => ({
            ...column,
            components: column?.components?.map((innerComponent: ExtendedComponentSchema) =>
              recursiveMappingFunction(innerComponent)
            ),
          })),
        };
      }

      return mappedComponent;
    };

    return {
      ...form,
      // @ts-ignore
      ...(form?.components?.length > 0 && {
        components: form?.components?.map(component => recursiveMappingFunction(component)),
      }),
    };
  }
}
