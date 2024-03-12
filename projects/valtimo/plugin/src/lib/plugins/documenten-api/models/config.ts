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

import {PluginConfigurationData} from '../../../models';

interface DocumentenApiConfig extends PluginConfigurationData {
  url: string;
  bronorganisatie: string;
  authenticationPluginConfiguration: string;
  apiVersion?: string;
}

type ConfidentialityLevel =
  | 'openbaar'
  | 'beperkt_openbaar'
  | 'intern'
  | 'zaakvertrouwelijk'
  | 'vertrouwelijk'
  | 'confidentieel'
  | 'geheim'
  | 'zeer_geheim';

type DocumentLanguage = 'nld';

type DocumentStatus = 'in_bewerking' | 'ter_vaststelling' | 'definitief' | 'gearchiveerd';

interface StoreTempDocumentConfig {
  fileName: string;
  confidentialityLevel: ConfidentialityLevel;
  title: string;
  description: string;
  localDocumentLocation: string;
  storedDocumentUrl: string;
  taal: DocumentLanguage;
  status: DocumentStatus;
  informatieobjecttype: string;
}

interface DocumentenApiVersion {
  selectedVersion: string;
}

interface DocumentenApiManagementVersion {
  selectedVersion: string;
  detectedVersions: string;
}

export interface DownloadDocumentConfig {
  processVariableName: string;
}

export {
  DocumentenApiConfig,
  StoreTempDocumentConfig,
  ConfidentialityLevel,
  DocumentLanguage,
  DocumentStatus,
  DocumentenApiVersion,
  DocumentenApiManagementVersion,
};
