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

import {AfterViewInit, Component, Input, OnDestroy, ViewChild} from '@angular/core';
import {ModalComponent} from '@valtimo/components';
import {ModalComponent as vModalComponent, ModalService} from '@valtimo/user-interface';
import {Subscription} from 'rxjs';
import {ConnectorModal} from '@valtimo/config';
import {ConnectorManagementStateService} from '../../services/connector-management-state/connector-management-state.service';

@Component({
  selector: 'valtimo-connector-modal',
  templateUrl: './connector-modal.component.html',
  styleUrls: ['./connector-modal.component.scss'],
})
export class ConnectorModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('modal') modal: ModalComponent;
  @ViewChild('vModal') vModal: vModalComponent;

  @Input() modalType: ConnectorModal;

  showSubscription!: Subscription;

  constructor(
    private readonly stateService: ConnectorManagementStateService,
    private readonly modalService: ModalService
  ) {}

  ngAfterViewInit(): void {
    this.showSubscription = this.stateService.showModal$.subscribe(show => {
      if (show) {
        this.show();
      } else {
        this.hide();
      }
    });
  }

  ngOnDestroy(): void {
    this.showSubscription?.unsubscribe();
  }

  hide(): void {
    // this.modal.hide();
    // this.modalService.closeModal();
  }

  hideModal(): void {
    // this.modal.hide();
    this.modalService.closeModal();
  }

  nextStep(stepIndex: number): void {
    console.log('went to next step from step', stepIndex);
  }

  complete(): void {
    console.log('complete');
    this.modalService.closeModal();
  }

  private show(): void {
    // this.modal.show();
    this.modalService.openModal(this.vModal);
  }
}
