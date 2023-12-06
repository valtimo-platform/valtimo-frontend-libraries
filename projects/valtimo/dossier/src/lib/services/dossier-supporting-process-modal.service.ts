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

import {Inject, Injectable, Optional} from '@angular/core';
import {START_SUPPORTING_PROCESS_MODAL_TOKEN} from '../constants/start-supporting-process-modal-token';
import {StartSupportingProcessModalConfig} from '../models/start-supporting-process.model';
import {BehaviorSubject, filter, map, Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DossierSupportingProcessModalService {
  private readonly _modalOpen$ = new BehaviorSubject<boolean>(false);
  private readonly _startSupportingProcessModalConfig$ =
    new BehaviorSubject<StartSupportingProcessModalConfig | null>(null);

  public get hasConfig$(): Observable<boolean> {
    return this._startSupportingProcessModalConfig$.pipe(map(config => !!config));
  }

  public get startSupportingProcessModalConfig$(): Observable<StartSupportingProcessModalConfig> {
    return this._startSupportingProcessModalConfig$.pipe(filter(config => !!config));
  }

  public get modalOpen$(): Observable<boolean> {
    return this._modalOpen$.asObservable();
  }

  constructor(
    @Optional()
    @Inject(START_SUPPORTING_PROCESS_MODAL_TOKEN)
    private readonly startSupportingProcessModalConfig: StartSupportingProcessModalConfig
  ) {
    if (this.startSupportingProcessModalConfig) {
      this._startSupportingProcessModalConfig$.next(this.startSupportingProcessModalConfig);
    }
  }

  public openModal(): void {
    this._modalOpen$.next(true);
  }

  public closeModal(): void {
    this._modalOpen$.next(false);
  }
}
