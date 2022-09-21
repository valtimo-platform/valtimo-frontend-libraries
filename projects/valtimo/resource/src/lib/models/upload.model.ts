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

import {Observable} from 'rxjs';
import {ResourceDto} from './uploader.model';

export interface ResourceFile {
  customUpload?: boolean;
  originalName: string;
  size: number;
  storage: string;
  type?: string;
  isLast?: boolean;
  url?: string;
  data: {
    baseUrl?: string;
    bucketName?: string;
    createdOn: string;
    extension?: string;
    form?: string;
    key?: string;
    name: string;
    project?: string;
    resourceId: string;
    sizeInBytes: number;
  };
}

export interface UploadService {
  uploadFile(file: File, documentDefinitionName?: string): Observable<ResourceFile>;
  getResource(resourceId: string): Observable<ResourceDto>;
  checkUploadProcessLink?(caseDefinitionKey: string): Observable<boolean>;
}
