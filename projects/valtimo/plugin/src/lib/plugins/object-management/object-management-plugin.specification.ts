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

import {PluginSpecification} from '../../models';
import {ObjectManagementConfigurationComponent} from './components/object-management-configuration/object-management-configuration.component';
import {OBJECT_MANAGEMENT_PLUGIN_LOGO_BASE64} from './assets/object-management-plugin-logo';

const objectManagementPluginSpecification: PluginSpecification = {
  pluginId: 'objectmanagement',
  pluginConfigurationComponent: ObjectManagementConfigurationComponent,
  pluginLogoBase64: OBJECT_MANAGEMENT_PLUGIN_LOGO_BASE64,
  functionConfigurationComponents: {
    // TODO: add components for actions
  },
  pluginTranslations: {
    nl: {
      // TODO: translate
      title: 'Object Management',
      description: 'Objecten aanmaken, ophalen, bijwerken of verwijderen via Object Management.',
      configurationDescription: 'Voor deze plug-in is geen configuratie vereist.',
      configurationTitle: 'Configuratienaam',
      configurationTitleTooltip:
        'Onder deze naam zal de plug-in te herkennen zijn in de rest van de applicatie.',
    },
    en: {
      title: 'Object Management',
      description: 'Create, Get, Update or Delete objects via Object Management.',
      configurationDescription: 'This plugin does not require any configuration.',
      configurationTitle: 'Configuration name',
      configurationTitleTooltip:
        'With this name the plugin will be recognizable in the rest of the application.',
    },
    de: {
      // TODO: translate
      title: 'Object Management',
      description: 'Objekte mit Object Management anlegen, lesen, aktualisieren oder löschen.',
      configurationDescription: 'Für dieses Plugin ist keine Konfiguration benötigt.',
      configurationTitle: 'Konfigurationsname',
      configurationTitleTooltip:
        'An diesem Namen wird das Plugin im Rest der Anwendung erkennbar sein.',
    },
  },
};

export {objectManagementPluginSpecification};
