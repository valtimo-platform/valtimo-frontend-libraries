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

import {Component, Input} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {delay, map, tap} from 'rxjs/operators';
import {v4 as uuidv4} from 'uuid';
import {ModalService} from '../../services/modal.service';

@Component({
  selector: 'v-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() appearingDelayMs = 140;

  public uuid: string = uuidv4();

  readonly visible$: Observable<boolean> = combineLatest([
    this.modalService.currentModalVisible$,
    this.modalService.currentModalUuid$,
  ]).pipe(
    map(([currentModalVisible, currentModalUuid]) => {
      return currentModalVisible && currentModalUuid === this.uuid;
    }),
    tap(visible => {
      if (visible) {
        this.appearing$.next(true);
        this.setAppearingTimeout();
      }
    })
  );

  readonly showBackdrop$: Observable<boolean> = this.visible$.pipe(delay(0));

  readonly appearing$ = new BehaviorSubject<boolean>(false);

  readonly disappearing$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly modalService: ModalService) {}

  closeModal(): void {
    this.disappearing$.next(true);
    this.setDisappearingTimeout();
    this.modalService.closeCurrentModal();
  }

  private setAppearingTimeout(): void {
    setTimeout(() => {
      this.appearing$.next(false);
    }, this.appearingDelayMs);
  }

  private setDisappearingTimeout(): void {
    setTimeout(() => {
      this.disappearing$.next(false);
    }, this.appearingDelayMs);
  }
}
