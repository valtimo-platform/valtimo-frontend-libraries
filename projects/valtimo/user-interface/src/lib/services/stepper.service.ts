/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.See the License for the specific language governing permissions and limitations under the License.
 */

import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Step} from '../models';

@Injectable()
export class StepperService {
  private readonly _steps$ = new BehaviorSubject<Array<Step>>([]);
  private readonly _currentStepIndex$ = new BehaviorSubject<number>(0);

  constructor() {}

  get currentStepIndex$() {
    return this._currentStepIndex$.asObservable();
  }

  get steps$() {
    return this._steps$.asObservable();
  }

  setSteps(steps: Array<Step>): void {
    console.log(steps);
    this._steps$.next(steps);
  }

  setCurrentStepIndex(index: number): void {
    console.log(index);
    this._currentStepIndex$.next(index);
  }
}
