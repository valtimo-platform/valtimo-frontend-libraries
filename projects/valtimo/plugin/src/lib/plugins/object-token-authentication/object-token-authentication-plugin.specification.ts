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
import {ObjectTokenAuthencationConfigurationComponent} from './components/object-token-authentication-configuration/object-token-authencation-configuration.component';
import {OBJECT_TOKEN_AUTHENTICATION_PLUGIN_LOGO_BASE64} from './assets/object-token-authentication-plugin-logo';

const objectTokenAuthenticationPluginSpecification: PluginSpecification = {
  pluginId: 'objecttokenauthentication',
  pluginConfigurationComponent: ObjectTokenAuthencationConfigurationComponent,
  pluginLogoBase64: OBJECT_TOKEN_AUTHENTICATION_PLUGIN_LOGO_BASE64,

  pluginTranslations: {
    nl: {
      title: 'Object token authenticatie',
      description:
        'Auhenticatie met behulp van tokens voor gebruik door de Objecten API en Objecttypen API.',
      configurationTitle: 'Configuratienaam',
      token: 'Token',
      tokenTooltip:
        'Het token is een sleutel waarmee toestemmingen verleend zijn om specifieke objecttypen en objecten te mogen ophalen',
    },
    en: {
      title: 'Object token authentication',
      description: 'Authentication using tokens for use by the Objects API and Object Types API.',
      configurationTitle: 'Configuration name',
      token: 'Token',
      tokenTooltip:
        'The token is a key that grants permissions to access specific object types and objects',
    },
    de: {
      title: 'Objekt-Token-Authentifizierung',
      description:
        'Authentifizierung mit Token zur Verwendung durch die Objects-API und die Object Types-API.',
      configurationTitle: 'Konfigurationsname',
      token: 'Token',
      tokenTooltip:
        'Das Token ist ein Schlüssel, der Berechtigungen zum Anzeigen bestimmter Objekttypen und Objekte erteilt',
    },
  },
};

export {objectTokenAuthenticationPluginSpecification};
