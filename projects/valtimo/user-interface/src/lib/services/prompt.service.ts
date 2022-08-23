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
import {BehaviorSubject} from 'rxjs';
import {take, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  private readonly _promptVisible$ = new BehaviorSubject<boolean>(false);
  private readonly _appearing$ = new BehaviorSubject<boolean>(false);
  private readonly _disappearing$ = new BehaviorSubject<boolean>(false);
  private readonly _appearingDelayMs$ = new BehaviorSubject<number>(140);

  get promptVisible$() {
    return this._promptVisible$.pipe(
      tap(visible => {
        if (visible) {
          this._appearing$.next(true);
          this.setAppearingTimeout();
        }
      })
    );
  }

  get appearing$() {
    return this._appearing$.asObservable();
  }

  get disappearing$() {
    return this._disappearing$.asObservable();
  }

  get appearingDelayMs$() {
    return this._appearingDelayMs$.asObservable();
  }

  get appearingDelayMs() {
    return this._appearingDelayMs$.getValue();
  }

  openPrompt(): void {
    this._promptVisible$.next(true);
  }

  closePrompt(callBackFunction?: () => void): void {
    this._disappearing$.next(true);
    this.setDisappearingTimeout();
    this._promptVisible$.next(false);

    if (callBackFunction) {
      setTimeout(() => {
        callBackFunction();
      }, this.appearingDelayMs);
    }
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
