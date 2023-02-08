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

import {FormOutput} from './form';

type MultiInputType = 'keyValue' | 'value';

interface MultiInputKeyValue {
  uuid?: string;
  key: string;
  value: string;
}

interface MultiInputFormValue {
  uuid?: string;
  value: FormOutput | {};
}

type MultiInputValues = Array<MultiInputKeyValue>;

type MultiInputFormsValues = Array<MultiInputFormValue>;

type MultiInputOutput = MultiInputValues | Array<string>;

export {
  MultiInputType,
  MultiInputValues,
  MultiInputKeyValue,
  MultiInputOutput,
  MultiInputFormValue,
  MultiInputFormsValues,
};
