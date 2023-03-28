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

type ConfidentialityLevel =
  | 'openbaar'
  | 'beperkt_openbaar'
  | 'intern'
  | 'zaakvertrouwelijk'
  | 'vertrouwelijk'
  | 'confidentieel'
  | 'geheim'
  | 'zeer_geheim';

type DocumentStatus = 'in_bewerking' | 'ter_vaststelling' | 'definitief' | 'gearchiveerd';

type DocumentLanguage = 'nld' | 'eng' | 'deu';

interface DocumentenApiMetadata {
  title: string;
  description: string;
  filename: string;
  confidentialityLevel: ConfidentialityLevel;
  author: string;
  status: DocumentStatus;
  creationDate: string;
  receiptDate: string;
  sendDate: string;
  language: DocumentLanguage;
  informatieobjecttype: string;
}

type AdditionalDocumentDate = 'sent' | 'received' | 'neither';

export {
  DocumentenApiMetadata,
  ConfidentialityLevel,
  DocumentStatus,
  DocumentLanguage,
  AdditionalDocumentDate,
};
