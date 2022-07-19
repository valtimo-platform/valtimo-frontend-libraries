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

import {Component, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, Subject} from 'rxjs';
import {ModalParams, SaveProcessLinkRequest} from '../../models';
import {ModalComponent, ModalService} from '@valtimo/user-interface';
import {ProcessLinkStateService} from '../../services/process-link-state.service';
import {take} from 'rxjs/operators';
import {PluginConfigurationData} from '@valtimo/plugin';
import {ProcessLinkService} from '../../services';
import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'valtimo-process-link',
  templateUrl: './process-link.component.html',
  styleUrls: ['./process-link.component.scss'],
})
export class ProcessLinkComponent {
  @ViewChild('createProcessLink') createProcessLinkModal: ModalComponent;
  @ViewChild('editProcessLink') editProcessLinkModal: ModalComponent;

  readonly returnToFirstStepSubject$ = new Subject<boolean>();
  readonly selectedPluginDefinition$ = this.stateService.selectedPluginDefinition$;
  readonly selectedPluginConfiguration$ = this.stateService.selectedPluginConfiguration$;
  readonly selectedPluginFunction$ = this.stateService.selectedPluginFunction$;
  readonly inputDisabled$ = this.stateService.inputDisabled$;
  readonly functionConfigurationValid$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly modalService: ModalService,
    private readonly stateService: ProcessLinkStateService,
    private readonly processLinkService: ProcessLinkService,
    private readonly logger: NGXLogger
  ) {}

  complete(): void {
    this.stateService.save();
  }

  hide(): void {
    this.modalService.closeModal(() => {
      this.returnToFirstStepSubject$.next(true);
      this.stateService.clear();
    });
  }

  unlink(): void {
    this.logger.error('Endpoint for removing process link has not been implemented.');
  }

  openModal(params: ModalParams): void {
    this.processLinkService
      .getProcessLink({
        processDefinitionId: params.processDefinitionKey,
        activityId: params?.element?.id,
      })
      .subscribe(
        processLinks => {
          if (processLinks?.length > 0) {
            this.stateService.selectProcessLink(processLinks[0]);
            this.openEditModal(params);
          } else {
            this.openCreateModal(params);
          }
        },
        () => {
          this.openCreateModal(params);
        }
      );
  }

  onValid(valid: boolean): void {
    this.functionConfigurationValid$.next(valid);
  }

  onConfiguration(configuration: PluginConfigurationData): void {
    this.stateService.disableInput();

    combineLatest([
      this.modalService.modalData$,
      this.stateService.selectedPluginConfiguration$,
      this.stateService.selectedPluginFunction$,
    ])
      .pipe(take(1))
      .subscribe(([modalData, selectedConfiguration, selectedFunction]) => {
        const processLinkRequest: SaveProcessLinkRequest = {
          actionProperties: configuration,
          activityId: modalData?.element?.id,
          pluginConfigurationId: selectedConfiguration.id,
          processDefinitionId: modalData?.processDefinitionKey,
          pluginActionDefinitionKey: selectedFunction.key,
        };

        this.processLinkService.saveProcessLink(processLinkRequest).subscribe(
          response => {
            this.hide();
            this.stateService.enableInput();
          },
          () => {
            this.logger.error('Something went wrong with saving the process link.');
            this.stateService.enableInput();
          }
        );
      });
  }

  onModifyConfiguration(configuration: PluginConfigurationData): void {
    console.log(configuration);
  }

  private openCreateModal(params: ModalParams): void {
    this.modalService.openModal(this.createProcessLinkModal, params);
  }

  private openEditModal(params: ModalParams): void {
    this.modalService.openModal(this.editProcessLinkModal, params);
  }
}
