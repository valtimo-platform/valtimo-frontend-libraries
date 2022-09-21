/*
 * Copyright 2015-2022 Ritense BV, the Netherlands.
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
import {Component} from '@angular/core';
import {ConfigService, UploadProvider, ValtimoConfig} from '@valtimo/config';

@Component({
  selector: 'valtimo-dossier-management-link-process',
  templateUrl: './dossier-management-link-process.component.html',
  styleUrls: ['./dossier-management-link-process.component.scss'],
})
export class DossierManagementLinkProcessComponent {
  documentenApiUploadProvider!: boolean;

  constructor(private readonly configService: ConfigService) {
    this.setDocumentenApiUploaderProvider(configService.config);
  }

  private setDocumentenApiUploaderProvider(config: ValtimoConfig): void {
    this.documentenApiUploadProvider = config.uploadProvider === UploadProvider.DOCUMENTEN_API;
  }
}
