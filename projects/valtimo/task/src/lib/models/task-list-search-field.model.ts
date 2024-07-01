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

enum TaskListSearchFieldDataType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  TIME = 'TIME',
  BOOLEAN = 'BOOLEAN',
}

enum TaskListSearchFieldFieldType {
  TEXT_CONTAINS = 'TEXT_CONTAINS',
  SINGLE = 'SINGLE',
  RANGE = 'RANGE',
  SINGLE_SELECT_DROPDOWN = 'SINGLE_SELECT_DROPDOWN',
  MULTI_SELECT_DROPDOWN = 'MULTI_SELECT_DROPDOWN',
}

enum TaskListSearchFieldMatchType {
  LIKE = 'LIKE',
  EXACT = 'EXACT',
}

interface TaskListSearchField {
  id: string;
  ownerId: string;
  dataType: TaskListSearchFieldDataType;
  fieldType: TaskListSearchFieldFieldType;
  key: string;
  title?: string;
  path: string;
  order: number;
  matchType: TaskListSearchFieldMatchType;
  dropdownDataProvider?: string;
}

export {
  TaskListSearchFieldDataType,
  TaskListSearchFieldFieldType,
  TaskListSearchFieldMatchType,
  TaskListSearchField,
};
