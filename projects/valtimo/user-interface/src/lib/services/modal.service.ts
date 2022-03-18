/*
 *  * Copyright 2015-2020 Ritense BV, the Netherlands.
 *  *
 *  * Licensed under EUPL, Version 1.2 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" basis,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 */

import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {take} from 'rxjs/operators';
import {ModalComponent} from '../components/modal/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly _modalUuid$ = new BehaviorSubject<string>('');
  private readonly _modalVisible$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  get modalUuid$() {
    return this._modalUuid$;
  }

  get modalVisible$() {
    return this._modalVisible$;
  }

  setCurrentModal(modalComponent: ModalComponent): void {
    this._modalUuid$.next(modalComponent.uuid);
  }

  openModal(modalComponent?: ModalComponent): void {
    this._modalVisible$.next(true);

    if (modalComponent) {
      this._modalUuid$.pipe(take(1)).subscribe(currentModalUuid => {
        if (modalComponent.uuid !== currentModalUuid) {
          this.setCurrentModal(modalComponent);
        }
      });
    }
  }

  closeModal(): void {
    this._modalVisible$.next(false);
  }
}
