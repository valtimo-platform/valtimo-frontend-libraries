/*
 * Copyright 2015-2023 Ritense BV, the Netherlands.
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
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserInterfaceService {
  private readonly _showPageHeader$ = new BehaviorSubject<boolean>(true);

  get showPageHeader$() {
    return this._showPageHeader$.asObservable();
  }

  showPageHeader(): void {
    this._showPageHeader$.next(true);
  }

  hidePageHeader(): void {
    this._showPageHeader$.next(false);
  }

  togglePageHeader(): void {
    this._showPageHeader$.pipe(take(1)).subscribe(showPageHeader => {
      this._showPageHeader$.next(!showPageHeader);
    });
  }
}
