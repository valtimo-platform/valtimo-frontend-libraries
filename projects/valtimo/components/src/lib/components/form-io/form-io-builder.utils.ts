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

import {ValtimoWindow} from '@valtimo/config';

const modiyEditFormApiKeyInput = (editForm: any): void => {
  const keyField = editForm?.components
    ?.find(element => element?.key === 'tabs')
    ?.components?.find(element => element?.key === 'api')
    ?.components?.find(element => element?.key === 'key');

  if (keyField) delete keyField.validate;

  return editForm;
};

const addValueResolverSelectorToEditform = (editForm: any): void => {
  const valtimoWindow = window as ValtimoWindow;

  if (valtimoWindow?.flags?.formioValueResolverSelectorComponentRegistered) {
    editForm?.components
      ?.find(element => element.key === 'tabs')
      ?.components?.push({
        label: 'Valtimo',
        key: 'valtimo',
        weight: 70,
        components: [
          {
            type: 'valtimo-value-resolver-selector',
            input: true,
            key: 'sourceField',
            label: 'Value resolver',
            validate: {
              required: false,
            },
          },
        ],
      });
  }

  return editForm;
};

export {modiyEditFormApiKeyInput, addValueResolverSelectorToEditform};
