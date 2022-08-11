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
import {ZAKEN_API_PLUGIN_LOGO_BASE64} from './assets';
import {LinkDocumentToZaakConfigurationComponent} from './components/link-document-to-zaak/link-document-to-zaak-configuration.component';
import {ZakenApiConfigurationComponent} from './components/zaken-api-configuration/zaken-api-configuration.component';

const zakenApiPluginSpecification: PluginSpecification = {
  pluginId: 'zakenapi',
  /*
  A component of the interface PluginConfigurationComponent, used to configure the plugin itself.
   */
  pluginConfigurationComponent: ZakenApiConfigurationComponent,
  pluginLogoBase64: ZAKEN_API_PLUGIN_LOGO_BASE64,
  functionConfigurationComponents: {
    'link-document-to-zaak': LinkDocumentToZaakConfigurationComponent,
  },

  pluginTranslations: {
    nl: {
      title: 'Zaken API',
      url: 'URL',
      description:
        'API voor het koppel van een bestaand document in de Documenten API met een Zaak',
      'link-document-to-zaak': 'Koppel bestaand document',
      configurationTitle: 'Configuratienaam',
      documentUrl: 'URL naar openzaak API',
      titel: 'Titel van het document',
      beschrijving: 'Beschrijving van het document',
      authenticationPluginConfiguration: 'Configuratie authenticatie-plug-in',
      linkDocumentInformation:
        'Hiermee kunt u een document dat reeds geupload is naar de Documenten API koppelen aan de Zaak die hoort bij het dossier.',
    },
    en: {
      title: 'Zaken API',
      url: 'URL',
      description: 'API for linking existing Documents to a Zaak',
      'link-document-to-zaak': 'Link existing document',
      configurationTitle: 'Configuratienaam',
      documentUrl: 'URL to openzaak API',
      titel: 'Title of the  document',
      beschrijving: 'Description of the document',
      authenticationPluginConfiguration: 'Authentication plugin configuration',
      linkDocumentInformation:
        'This allows you to link a document that has already been uploaded to the Documents API to the Case associated with the case.',
    },
    de: {
      title: 'Geschäfts-API',
      url: 'URL',
      description: 'API zum Verknüpfen eines Dokuments mit einem Fall.',
      'link-document-to-zaak': 'Vorhandenes Dokument verknüpfen',
      configurationTitle: 'Configuratienaam',
      documentUrl: 'URL zur openzaak-API',
      titel: 'Titel des Dokuments',
      beschrijving: 'Beschreibung des Dokuments',
      authenticationPluginConfiguration: 'Authentifizierungs-Plugin-Konfiguration',
      linkDocumentInformation:
        'Auf diese Weise können Sie ein Dokument, das bereits in die Dokumenten-API hochgeladen wurde, mit dem Fall verknüpfen, der dem Fall zugeordnet ist.',
    },
  },
};

export {zakenApiPluginSpecification};
