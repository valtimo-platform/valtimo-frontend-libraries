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
import {BehaviorSubject, Subject} from 'rxjs';
import {ModalParams} from '../../models';
import {ModalComponent, ModalService} from '@valtimo/user-interface';
import {ProcessLinkStateService} from '../../services/process-link-state.service';
import {take} from 'rxjs/operators';
import {PluginConfigurationData} from '@valtimo/plugin';

@Component({
  selector: 'valtimo-process-link',
  templateUrl: './process-link.component.html',
  styleUrls: ['./process-link.component.scss'],
})
export class ProcessLinkComponent {
  @ViewChild('pluginModal') connectorCreateModal: ModalComponent;

  readonly returnToFirstStepSubject$ = new Subject<boolean>();
  readonly selectedPluginDefinition$ = this.stateService.selectedPluginDefinition$;
  readonly selectedPluginConfiguration$ = this.stateService.selectedPluginConfiguration$;
  readonly selectedPluginFunction$ = this.stateService.selectedPluginFunction$;
  readonly inputDisabled$ = this.stateService.inputDisabled$;
  readonly functionConfigurationValid$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly modalService: ModalService,
    private readonly stateService: ProcessLinkStateService
  ) {}

  complete(): void {
    this.stateService.save();
  }

  hide(): void {
    this.modalService.closeModal();

    this.modalService.appearingDelayMs$.pipe(take(1)).subscribe(appearingDelay => {
      setTimeout(() => {
        this.returnToFirstStepSubject$.next(true);
        this.stateService.clear();
      }, appearingDelay);
    });
  }

  openModal(params: ModalParams): void {
    this.modalService.openModal(this.connectorCreateModal, params);
  }

  onValid(valid: boolean): void {
    this.functionConfigurationValid$.next(valid);
  }

  onConfiguration(configuration: PluginConfigurationData): void {
    const pluginConfiguration = {...configuration};
    delete pluginConfiguration['configurationTitle'];

    this.stateService.disableInput();

    console.log('function save', configuration);

    // this.stateService.selectedPluginDefinition$.pipe(take(1)).subscribe(selectedDefinition => {
    //   this.pluginManagementService
    //     .savePluginConfiguration({
    //       definitionKey: selectedDefinition.key,
    //       title: configuration.configurationTitle,
    //       properties: pluginConfiguration,
    //     })
    //     .subscribe(
    //       response => {
    //         this.stateService.refresh();
    //         this.hide();
    //       },
    //       () => {
    //         this.logger.error('Something went wrong with saving the plugin configuration.');
    //         this.hide();
    //       }
    //     );
    // });
  }
}
