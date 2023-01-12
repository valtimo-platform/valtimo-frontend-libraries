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
import {PortaaltaakConfigurationComponent} from './components/portaaltaak-configuration/portaaltaak-configuration.component';
import {PORTAALTAAK_PLUGIN_LOGO_BASE64} from './assets/portaaltaak-plugin-logo';

const portaaltaakPluginSpecification: PluginSpecification = {
  pluginId: 'portaaltaakplugin',
  pluginConfigurationComponent: PortaaltaakConfigurationComponent,
  pluginLogoBase64: PORTAALTAAK_PLUGIN_LOGO_BASE64,
  pluginTranslations: {
    nl: {
      title: 'Portaaltaak',
      url: 'Portaaltaak URL',
      urlTooltip: 'Een URL naar de REST API van Portaaltaak',
      description: 'Een API om een portaaltaakrouteringscomponent te benaderen.',
      configurationTitle: 'Configuratienaam',
      configurationTitleTooltip:
        'De naam van de huidige plugin-configuratie. Onder deze naam kan de configuratie in de rest van de applicatie teruggevonden worden.',
      authenticationPluginConfiguration: 'Configuratie authenticatie-plug-in',
    },
    en: {
      title: 'Portal task',
      url: 'Portal task URL',
      urlTooltip: 'A URL to the REST API of Portal task',
      description: 'An API to access a portal task routing component.',
      configurationTitle: 'Configuration name',
      configurationTitleTooltip:
        'The name of the current plugin configuration. Under this name, the configuration can be found in the rest of the application.',
      authenticationPluginConfiguration: 'Authentication plugin configuration',
    },
    de: {
      title: 'Portalaufgabe',
      url: 'Portalaufgabe-URL',
      urlTooltip: 'Die URL zur REST API von Portalaufgabe',
      description: 'Eine API für den Zugriff auf eine Portal-Aufgabenweiterleitungskomponente.',
      configurationTitle: 'Konfigurationsname',
      configurationTitleTooltip:
        'Der Name der aktuellen Plugin-Konfiguration. Unter diesem Namen ist die Konfiguration im Rest der Anwendung zu finden.',
      authenticationPluginConfiguration: 'Authentifizierungs-Plugin-Konfiguration',
    },
  },
};

export {portaaltaakPluginSpecification};
