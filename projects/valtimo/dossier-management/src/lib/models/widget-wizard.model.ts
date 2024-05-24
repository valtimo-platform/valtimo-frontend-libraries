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

enum WidgetWizardSteps {
  TYPE,
  WIDTH,
  STYLE,
  CONTENT,
}

enum WidgetType {
  FIELDS = 'fields',
}

interface WidgetTypeTile {
  titleKey: string;
  descriptionKey: string;
  illustrationUrl: string;
  type: WidgetType;
}

const AVAILABLE_WIDGET_TYPES: WidgetTypeTile[] = [
  {
    titleKey: 'widgetTabManagement.types.fields.title',
    descriptionKey: 'widgetTabManagement.types.fields.description',
    illustrationUrl: 'valtimo-layout/img/widget-management/types/fields.svg',
    type: WidgetType.FIELDS,
  },
];

export {WidgetWizardSteps, WidgetTypeTile, AVAILABLE_WIDGET_TYPES, WidgetType};
