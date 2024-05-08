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

import {ViewType} from '@valtimo/components';

interface ConfiguredColumn {
  key: string;
  sortable: boolean;
  filterable: boolean;
  defaultSort: 'ASC' | 'DESC' | null;
}

const COLUMN_VIEW_TYPES: {[key: string]: ViewType} = {
  creatiedatum: ViewType.DATE,
  locked: ViewType.BOOLEAN,
  trefwoorden: ViewType.TAGS
};

export {ConfiguredColumn, COLUMN_VIEW_TYPES};
