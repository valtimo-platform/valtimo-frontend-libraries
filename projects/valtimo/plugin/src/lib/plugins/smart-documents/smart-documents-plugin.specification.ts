/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.See the License for the specific language governing permissions and limitations under the License.
 */

import {PluginSpecification} from '../../models';
import {SmartDocumentsConfigurationComponent} from './components/smart-documents-configuration/smart-documents-configuration.component';
import {SMART_DOCUMENTS_PLUGIN_LOGO_BASE64} from './assets';
import {GenerateDocumentConfigurationComponent} from './components/generate-document-configuration/generate-document-configuration.component';

const smartDocumentsPluginSpecification: PluginSpecification = {
  pluginId: 'smartdocuments',
  pluginConfigurationComponent: SmartDocumentsConfigurationComponent,
  pluginLogoBase64: SMART_DOCUMENTS_PLUGIN_LOGO_BASE64,
  functionConfigurationComponents: {
    'generate-document': GenerateDocumentConfigurationComponent,
  },
  pluginTranslations: {
    nl: {
      title: 'SmartDocuments',
      description: 'Automatiseer documenten met slimme templates.',
      name: 'Configuratienaam',
      url: 'SmartDocuments URL',
      username: 'Gebruikersnaam',
      password: 'Wachtwoord',
      'generate-document': 'Document genereren',
    },
    en: {
      title: 'SmartDocuments',
      description: 'Automate documents with smart templates.',
      name: 'Configuration name',
      url: 'SmartDocuments URL',
      username: 'Username',
      password: 'Password',
      'generate-document': 'Generate document',
    },
    de: {
      title: 'SmartDocuments',
      description: 'Automatisieren Sie Dokumente mit intelligenten Templates.',
      name: 'Konfigurationsname',
      url: 'SmartDocuments URL',
      username: 'Nutzername',
      password: 'Passwort',
      'generate-document': 'Dokument generieren',
    },
  },
};

export {smartDocumentsPluginSpecification};
