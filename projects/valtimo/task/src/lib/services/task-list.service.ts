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

import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable()
export class TaskListService {
  private readonly _caseDefinitionName$ = new BehaviorSubject<string | null>(null);

  public get caseDefinitionName$(): Observable<string | null> {
    return this._caseDefinitionName$.asObservable();
  }

  public setCaseDefinitionName(caseDefinitionName: string): void {
    this._caseDefinitionName$.next(caseDefinitionName);
  }
}
