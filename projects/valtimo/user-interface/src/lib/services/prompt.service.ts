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
import {BehaviorSubject, Observable} from 'rxjs';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  private readonly _promptVisible$ = new BehaviorSubject<boolean>(false);
  private readonly _appearing$ = new BehaviorSubject<boolean>(false);
  private readonly _disappearing$ = new BehaviorSubject<boolean>(false);
  private readonly _appearingDelayMs$ = new BehaviorSubject<number>(140);
  private readonly _headerText$ = new BehaviorSubject<string>('');
  private readonly _bodyText$ = new BehaviorSubject<string>('');
  private readonly _cancelText$ = new BehaviorSubject<string>('');
  private readonly _confirmText$ = new BehaviorSubject<string>('');
  private readonly _cancelMdiIcon$ = new BehaviorSubject<string>('');
  private readonly _confirmMdiIcon$ = new BehaviorSubject<string>('');

  get promptVisible$() {
    return this._promptVisible$.asObservable();
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

  get headerText$(): Observable<string> {
    return this._headerText$.asObservable();
  }

  get bodyText$(): Observable<string> {
    return this._bodyText$.asObservable();
  }

  get cancelText$(): Observable<string> {
    return this._cancelText$.asObservable();
  }

  get confirmText$(): Observable<string> {
    return this._confirmText$.asObservable();
  }

  get cancelMdiIcon$(): Observable<string> {
    return this._cancelMdiIcon$.asObservable();
  }

  get confirmMdiIcon$(): Observable<string> {
    return this._confirmMdiIcon$.asObservable();
  }

  openPrompt(
    headerText: string,
    bodyText: string,
    cancelButtonText: string,
    confirmButtonText: string,
    cancelMdiIcon?: string,
    confirmMdiIcon?: string
  ): void {
    this._headerText$.next(headerText);
    this._bodyText$.next(bodyText);
    this._cancelText$.next(cancelButtonText);
    this._confirmText$.next(confirmButtonText);
    if (cancelMdiIcon) this._cancelMdiIcon$.next(cancelMdiIcon);
    if (confirmMdiIcon) this._confirmMdiIcon$.next(confirmMdiIcon);

    this._promptVisible$.next(true);
    this._appearing$.next(true);
    this.setAppearingTimeout();
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

  setBodyText(bodyText: string): void {
    this._bodyText$.next(bodyText);
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
        this.clear();
      }, appearingDelayMs);
    });
  }

  private clear(): void {
    this._headerText$.next('');
    this._bodyText$.next('');
    this._cancelText$.next('');
    this._confirmText$.next('');
    this._cancelMdiIcon$.next('');
    this._confirmMdiIcon$.next('');
  }
}
