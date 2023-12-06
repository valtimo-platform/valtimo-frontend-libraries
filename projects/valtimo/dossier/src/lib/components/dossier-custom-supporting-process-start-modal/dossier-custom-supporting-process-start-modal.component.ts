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

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {DossierSupportingProcessModalService} from '../../services';

@Component({
  selector: 'valtimo-dossier-custom-supporting-process-start-modal',
  templateUrl: './dossier-custom-supporting-process-start-modal.component.html',
  styleUrls: ['./dossier-custom-supporting-process-start-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DossierCustomSupportingProcessStartModalComponent {
  public readonly startSupportingProcessModalConfig$ =
    this.dossierSupportingProcessModalService.startSupportingProcessModalConfig$;

  public readonly modalOpen$ = this.dossierSupportingProcessModalService.modalOpen$;

  constructor(
    private readonly dossierSupportingProcessModalService: DossierSupportingProcessModalService
  ) {}

  public onClose(): void {
    this.dossierSupportingProcessModalService.closeModal();
  }
}
