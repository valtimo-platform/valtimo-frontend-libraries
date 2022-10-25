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

import {InjectionToken} from '@angular/core';

import {DossierManagementSearchFieldsComponent} from './dossier-management-detail/tabs/dossier-management-search-fields/dossier-management-search-fields.component';
import {DossierManagementListComponent} from './dossier-management-list/dossier-management-list.component';
import {DefaultTabs} from './dossier-management-tab-enum';

export const TAB_MAP = new InjectionToken<Map<string, object>>('TabMap');
export const DEFAULT_TABS = new Map<string, object>([
  [DefaultTabs.caseDetails, DossierManagementListComponent],
  [DefaultTabs.searchFields, DossierManagementSearchFieldsComponent],
]);
