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

/*
 * Public API Surface of plugin
 */

export * from './lib/services';
export * from './lib/models';
export * from './lib/pipes';
export * from './lib/constants';
/* plugin configuration container */
export * from './lib/components/plugin-configuration-container/plugin-configuration-container.component';
export * from './lib/components/plugin-configuration-container/plugin-configuration-container.module';
/* open-zaak plugin */
export * from './lib/plugins/open-zaak/open-zaak-plugin.module';
export * from './lib/plugins/open-zaak/components/open-zaak-configuration/open-zaak-configuration.component';
export * from './lib/plugins/open-zaak/open-zaak-plugin.specification';
/* object token authentication plugin */
export * from './lib/plugins/object-token-authentication/object-token-authentication-plugin.module';
export * from './lib/plugins/object-token-authentication/object-token-authentication-plugin.specification';
export * from './lib/plugins/object-token-authentication/components/object-token-authentication-configuration/object-token-authencation-configuration.component';
/* smart-documents plugin */
export * from './lib/plugins/smart-documents/smart-documents-plugin.module';
export * from './lib/plugins/smart-documents/smart-documents-plugin.specification';
export * from './lib/plugins/smart-documents/components/smart-documents-configuration/smart-documents-configuration.component';
export * from './lib/plugins/smart-documents/components/generate-document-configuration/generate-document-configuration.component';
/* documenten api plugin */
export * from './lib/plugins/documenten-api/documenten-api-plugin.module';
export * from './lib/plugins/documenten-api/documenten-api-plugin.specification';
export * from './lib/plugins/documenten-api/components/store-temp-document/store-temp-document-configuration.component';
export * from './lib/plugins/documenten-api/components/documenten-api-configuration/documenten-api-configuration.component';
/* zaken api plugin */
export * from './lib/plugins/zaken-api/zaken-api-plugin.module';
export * from './lib/plugins/zaken-api/zaken-api-plugin.specification';
export * from './lib/plugins/zaken-api/components/zaken-api-configuration/zaken-api-configuration.component';
export * from './lib/plugins/zaken-api/components/link-document-to-zaak/link-document-to-zaak-configuration.component';
