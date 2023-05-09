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

import {Component} from '@angular/core';
import {
  ProcessLinkButtonService,
  ProcessLinkStateService,
  ProcessLinkStepService,
} from '../../services';

@Component({
  selector: 'valtimo-process-link-modal',
  templateUrl: './process-link-modal.component.html',
  styleUrls: ['./process-link-modal.component.scss'],
})
export class ProcessLinkModalComponent {
  public readonly showModal$ = this.processLinkState2Service.showModal$;
  public readonly processStepName$ = this.processLinkState2Service.elementName$;
  public readonly steps$ = this.processLinkStepService.steps$;
  public readonly currentStepIndex$ = this.processLinkStepService.currentStepIndex$;
  public readonly currentStepId$ = this.processLinkStepService.currentStepId$;
  public readonly showSaveButton$ = this.buttonService.showSaveButton$;
  public readonly enableSaveButton$ = this.buttonService.enableSaveButton$;
  public readonly showBackButton$ = this.buttonService.showBackButton$;
  public readonly showNextButton$ = this.buttonService.showNextButton$;
  public readonly enableNextButton$ = this.buttonService.enableNextButton$;

  public readonly hasOneProcessLinkType$ = this.processLinkStepService.hasOneProcessLinkType$;
  public readonly saving$ = this.processLinkState2Service.saving$;

  constructor(
    private readonly processLinkState2Service: ProcessLinkStateService,
    private readonly processLinkStepService: ProcessLinkStepService,
    private readonly buttonService: ProcessLinkButtonService
  ) {}

  selectProcessLinkType(processLinkTypeId: string): void {
    this.processLinkState2Service.selectProcessLinkType(processLinkTypeId);
  }

  closeModal(): void {
    this.processLinkState2Service.closeModal();
  }

  backButtonClick(): void {
    this.buttonService.clickBackButton();
  }

  saveButtonClick(): void {
    this.buttonService.clickSaveButton();
  }

  nextButtonClick(): void {
    this.buttonService.clickNextButton();
  }
}
