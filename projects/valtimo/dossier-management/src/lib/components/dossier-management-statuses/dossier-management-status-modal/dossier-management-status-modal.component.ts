/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {StatusModalCloseEvent, StatusModalType} from '../../../models';
import {BehaviorSubject, map} from 'rxjs';
import {CARBON_CONSTANTS} from '@valtimo/components';

@Component({
  selector: 'valtimo-dossier-management-status-modal',
  templateUrl: './dossier-management-status-modal.component.html',
  styleUrls: ['./dossier-management-status-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DossierManagementStatusModalComponent {
  @Input() public set type(value: StatusModalType) {
    this._type.next(value);

    if (value === 'closed') {
      setTimeout(() => {
        this._typeAnimationDelay$.next(value);
      }, CARBON_CONSTANTS.modalAnimationMs);
    } else {
      this._typeAnimationDelay$.next(value);
    }
  }

  @Output() public closeModalEvent = new EventEmitter<StatusModalCloseEvent>();

  private readonly _type = new BehaviorSubject<StatusModalType>(undefined);
  private readonly _typeAnimationDelay$ = new BehaviorSubject<StatusModalType>(undefined);

  public readonly isEdit$ = this._typeAnimationDelay$.pipe(map(type => type === 'edit'));
  public readonly isAdd$ = this._typeAnimationDelay$.pipe(map(type => type === 'add'));
  public readonly isClosed$ = this._type.pipe(map(type => type === 'closed'));

  public onClose(): void {
    this.closeModalEvent.emit('close');
  }
}
