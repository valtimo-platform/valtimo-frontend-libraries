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
import {ProcessLinkState2Service, ProcessLinkStepService} from '../../services';

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
  public readonly showSaveButton$ = this.processLinkState2Service.showSaveButton$;
  public readonly enableSaveButton$ = this.processLinkState2Service.enableSaveButton$;
  public readonly showBackButton$ = this.processLinkState2Service.showBackButton$;
  public readonly hasOneOption$ = this.processLinkState2Service.hasOneOption$;
  public readonly disableInput$ = this.processLinkState2Service.disableInput$;

  constructor(
    private readonly processLinkState2Service: ProcessLinkState2Service,
    private readonly processLinkStepService: ProcessLinkStepService
  ) {}

  selectProcessLinkType(processLinkTypeId: string): void {
    this.processLinkState2Service.selectProcessLinkType(processLinkTypeId);
  }

  closeModal(): void {
    this.processLinkState2Service.closeModal();
  }

  backButtonClick(): void {
    this.processLinkState2Service.clickBackButton();
  }

  saveButtonClick(): void {
    this.processLinkState2Service.clickSaveButton();
  }
}
