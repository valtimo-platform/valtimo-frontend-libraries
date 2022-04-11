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
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {ConnectorModal} from '@valtimo/config';
import {ConnectorManagementStateService} from '../../services/connector-management-state/connector-management-state.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'valtimo-connector-modal',
  templateUrl: './connector-modal.component.html',
  styleUrls: ['./connector-modal.component.scss'],
})
export class ConnectorModalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('connectorCreateModal') connectorCreateModal: vModalComponent;
  @ViewChild('connectorEditModal') connectorEditModal: vModalComponent;

  showSubscription!: Subscription;

  readonly connectorTypeSelected$ = this.stateService.selectedConnector$;
  readonly saveButtonDisabled$ = this.stateService.saveButtonDisabled$;
  readonly inputDisabled$ = this.stateService.inputDisabled$;
  readonly returnToFirstStepSubject$ = new Subject<boolean>();

  constructor(
    private readonly stateService: ConnectorManagementStateService,
    private readonly modalService: ModalService
  ) {}

  ngAfterViewInit(): void {
    this.openShowSubscription();
  }

  ngOnDestroy(): void {
    this.showSubscription?.unsubscribe();
  }

  hide(): void {
    this.stateService.disableInput();
    this.modalService.closeModal();

    this.modalService.appearingDelayMs$.pipe(take(1)).subscribe(appearingDelay => {
      setTimeout(() => {
        this.returnToFirstStep();
        this.stateService.enableInput();
        this.stateService.clearSelectedConnector();
      }, appearingDelay);
    });
  }

  complete(): void {
    this.stateService.save();
  }

  delete(): void {
    this.stateService.delete();
  }

  private openShowSubscription(): void {
    this.showSubscription = this.stateService.showModal$.subscribe(show => {
      if (show) {
        this.show();
      } else {
        this.hide();
      }
    });
  }

  private returnToFirstStep(): void {
    this.returnToFirstStepSubject$.next(true);
  }

  private show(): void {
    this.stateService.modalType$.pipe(take(1)).subscribe(modalType => {
      if (modalType === 'add') {
        this.modalService.openModal(this.connectorCreateModal);
      } else if (modalType === 'modify') {
        this.modalService.openModal(this.connectorEditModal);
      }
    });
  }
}
