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
import {VerzoekConfigurationComponent} from './components/verzoek-configuration/verzoek-configuration.component';
import {VERZOEK_PLUGIN_LOGO_BASE64} from './assets/verzoek-plugin-logo';

const verzoekPluginSpecification: PluginSpecification = {
  pluginId: 'verzoek',
  pluginConfigurationComponent: VerzoekConfigurationComponent,
  pluginLogoBase64: VERZOEK_PLUGIN_LOGO_BASE64,
  pluginTranslations: {
    nl: {
      title: 'Verzoek',
      description: 'Verzoek plug-in',
    },
    en: {
      title: 'Verzoek',
      description: 'Verzoek plugin',
    },
    de: {
      title: 'Verzoek',
      description: 'Verzoek plug-in',
    },
  },
};

export {verzoekPluginSpecification};
