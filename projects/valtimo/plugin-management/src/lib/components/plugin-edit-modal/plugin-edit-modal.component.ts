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

import {Component, OnInit, ViewChild} from '@angular/core';
import {PluginManagementService, PluginManagementStateService} from '../../services';
import {take} from 'rxjs/operators';
import {ModalComponent, ModalService} from '@valtimo/user-interface';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {PluginConfigurationData} from '@valtimo/plugin';
import {NGXLogger} from 'ngx-logger';
import {PluginConfiguration} from '../../models';

@Component({
  selector: 'valtimo-plugin-edit-modal',
  templateUrl: './plugin-edit-modal.component.html',
  styleUrls: ['./plugin-edit-modal.component.scss'],
})
export class PluginEditModalComponent implements OnInit {
  @ViewChild('pluginEditModal') pluginEditModal: ModalComponent;

  readonly inputDisabled$ = this.stateService.inputDisabled$;
  readonly selectedPluginConfiguration$: Observable<PluginConfiguration> =
    this.stateService.selectedPluginConfiguration$;
  readonly configurationValid$ = new BehaviorSubject<boolean>(false);

  private showSubscription!: Subscription;
  private hideSubscription!: Subscription;

  constructor(
    private readonly stateService: PluginManagementStateService,
    private readonly modalService: ModalService,
    private readonly pluginManagementService: PluginManagementService,
    private readonly logger: NGXLogger
  ) {}

  ngOnInit(): void {
    this.openShowSubscription();
    this.openHideSubscription();
  }

  save(): void {
    this.stateService.saveEdit();
  }

  delete(): void {
    console.log('delete');
  }

  hide(): void {
    this.stateService.disableInput();
    this.modalService.closeModal(() => {
      this.stateService.enableInput();
      this.stateService.clear();
    });
  }

  onPluginValid(valid: boolean): void {
    this.configurationValid$.next(valid);
  }

  onPluginConfiguration(configuration: PluginConfigurationData): void {
    console.log('on config', configuration);
  }

  private openShowSubscription(): void {
    this.showSubscription = this.stateService.showModal$.subscribe(modalType => {
      if (modalType === 'edit') {
        this.show();
      }
    });
  }

  private openHideSubscription(): void {
    this.hideSubscription = this.stateService.hideModal$.subscribe(() => {
      this.hide();
    });
  }

  private show(): void {
    this.modalService.openModal(this.pluginEditModal);
  }
}
