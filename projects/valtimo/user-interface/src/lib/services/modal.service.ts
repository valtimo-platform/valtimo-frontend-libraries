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

import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {map, take, tap} from 'rxjs/operators';
import {ModalComponent} from '../components/modal/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly _modalUuid$ = new BehaviorSubject<string>('');
  private readonly _modalVisible$ = new BehaviorSubject<boolean>(false);
  private readonly _appearing$ = new BehaviorSubject<boolean>(false);
  private readonly _disappearing$ = new BehaviorSubject<boolean>(false);
  private readonly _appearingDelayMs$ = new BehaviorSubject<number>(140);

  get modalUuid$() {
    return this._modalUuid$.asObservable();
  }

  get modalVisible$() {
    return this._modalVisible$.asObservable();
  }

  get appearing$() {
    return this._appearing$.asObservable();
  }

  get disappearing$() {
    return this._disappearing$.asObservable();
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
    this._disappearing$.next(true);
    this.setDisappearingTimeout();
    this._modalVisible$.next(false);
  }

  getModalVisible(modalUuid: string): Observable<boolean> {
    return combineLatest([this._modalVisible$, this._modalUuid$]).pipe(
      map(
        ([currentModalVisible, currentModalUuid]) =>
          currentModalVisible && currentModalUuid === modalUuid
      ),
      tap(visible => {
        if (visible) {
          this._appearing$.next(true);
          this.setAppearingTimeout();
        }
      })
    );
  }

  setAppearingDelay(appearingDelayMs: number): void {
    this._appearingDelayMs$.next(appearingDelayMs);
  }

  private setAppearingTimeout(): void {
    this._appearingDelayMs$.pipe(take(1)).subscribe(appearingDelayMs => {
      setTimeout(() => {
        this._appearing$.next(false);
      }, appearingDelayMs);
    });
  }

  private setDisappearingTimeout(): void {
    this._appearingDelayMs$.pipe(take(1)).subscribe(appearingDelayMs => {
      setTimeout(() => {
        this._disappearing$.next(false);
      }, appearingDelayMs);
    });
  }
}
