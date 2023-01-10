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
import {OpenNotificatiesConfigurationComponent} from './components/open-notificaties-configuration/open-notificaties-configuration.component';
import {OPEN_NOTIFICATIES_PLUGIN_LOGO_BASE64} from './assets';

const openNotificatiesPluginSpecification: PluginSpecification = {
  pluginId: 'notificatiesapiauthentication',
  pluginConfigurationComponent: OpenNotificatiesConfigurationComponent,
  pluginLogoBase64: OPEN_NOTIFICATIES_PLUGIN_LOGO_BASE64,
  pluginTranslations: {
    nl: {
      title: 'OpenNotificaties',
      description:
        'OpenNotificaties is een productiewaardig API platform die de API-standaard voor zaakgericht werken implementeert (de ZGW-API’s).',
      configurationTitle: 'Configuratienaam',
      configurationTitleTooltip:
        'Onder deze naam zal de plugin te herkennen zijn in de rest van de applicatie',
      clientId: 'Client ID',
      clientIdTooltip:
        'Vul hier het clientId in dat geconfigureerd staat onder OpenNotificaties-beheer (zie API authorisaties > Applicaties). Dit clientId moet de juiste authorisaties hebben voor de benodigde functionaliteit',
      clientSecret: 'Secret',
      clientSecretTooltip: 'Vul de secret in die hoort bij de clientId hierboven',
    },
    en: {
      title: 'OpenNotificaties',
      description:
        'OpenNotificaties is a production-worthy API platform that implements the API standard for case-oriented working (the ZGW APIs).',
      configurationTitle: 'Configuration name',
      configurationTitleTooltip:
        'Under this name, the plugin will be recognizable in the rest of the application',
      clientId: 'Client ID',
      clientIdTooltip:
        'Enter the clientId here which is configured under OpenNotificaties management (see API authorizations > Applications). This clientId must have the correct authorizations for the required functionality',
      clientSecret: 'Secret',
      clientSecretTooltip: 'Enter the secret associated with the clientId above',
    },
    de: {
      title: 'OpenNotificaties',
      description:
        'OpenNotificaties ist eine produktionstaugliche API-Plattform, die den API-Standard für fallorientiertes Arbeiten (die ZGW-APIs) implementiert.',
      configurationTitle: 'Konfigurationsname',
      configurationTitleTooltip:
        'Unter diesem Namen wird das Plugin im Rest der Anwendung erkennbar sein',
      clientId: 'Client ID',
      clientIdTooltip:
        'Geben Sie hier die clientId ein, die unter OpenNotificaties-Verwaltung konfiguriert ist (siehe API-Berechtigungen > Anwendungen). Diese clientId muss die richtigen Berechtigungen für die erforderliche Funktionalität haben',
      clientSecret: 'Secret',
      clientSecretTooltip: 'Geben Sie das mit der obigen clientId verknüpfte Geheimnis ein',
    },
  },
};

export {openNotificatiesPluginSpecification};
