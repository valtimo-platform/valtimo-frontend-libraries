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

import {PluginSpecification} from '../../models';
import {StoreTempDocumentConfigurationComponent} from './components/store-temp-document/store-temp-document-configuration.component';
import {DOCUMENTEN_API_PLUGIN_LOGO_BASE64} from './assets';
import {DocumentenApiConfigurationComponent} from './components/documenten-api-configuration/documenten-api-configuration.component';

const documentenApiPluginSpecification: PluginSpecification = {
  pluginId: 'smartdocuments',
  pluginConfigurationComponent: DocumentenApiConfigurationComponent,
  pluginLogoBase64: DOCUMENTEN_API_PLUGIN_LOGO_BASE64,
  functionConfigurationComponents: {
    'generate-document': StoreTempDocumentConfigurationComponent,
  },
  pluginTranslations: {
    nl: {
      title: 'Documenten API',
      description: 'API voor opslag en ontsluiting van documenten en daarbij behorende metadata.',
      configurationTitle: 'Configuratienaam',
      url: 'Documenten API URL',
      localDocumentLocation: 'Naam procesvariabele met document',
      storedDocumentUrl: 'Naam procesvariabele voor opslag document-URL',
      taal: 'Taal',
      status: 'Status',
      informatieobjecttype: 'informatieobjecttype',
    },
    en: {
      title: 'Documenten API',
      description: 'API for storing and accessing documents and associated metadata.',
      configurationTitle: 'Configuration name',
      url: 'Documenten API URL',
      localDocumentLocation: 'Name of process variable with document',
      storedDocumentUrl: 'Process variable name for storing document URL',
      taal: 'Language',
      status: 'Status',
      informatieobjecttype: 'informatieobjecttype',
    },
    de: {
      title: 'Documenten API',
      description: 'API zum Speichern und Zugreifen auf Dokumente und zugehörige Metadaten.',
      configurationTitle: 'Konfigurationsname',
      url: 'Documenten API URL',
      localDocumentLocation: 'Name Prozessvariable mit Dokument',
      storedDocumentUrl: 'Name der Prozessvariablen zum Speichern der Dokument-URL',
      taal: 'Sprache',
      status: 'Status',
      informatieobjecttype: 'informatieobjecttype',
    },
  },
};

export {documentenApiPluginSpecification};
