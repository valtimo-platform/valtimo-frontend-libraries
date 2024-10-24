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

import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, filter, Observable} from 'rxjs';
import {FormFlowCustomComponentDefinition} from '../models';
import {FORM_FLOW_COMPONENT_TOKEN} from '../constants';

@Injectable({
  providedIn: 'root',
})
export class FormFlowComponentService {
  private readonly _supportedComponents$ =
    new BehaviorSubject<Array<FormFlowCustomComponentDefinition> | null>(null);

  public get supportedComponents$(): Observable<Array<FormFlowCustomComponentDefinition>> {
    return this._supportedComponents$.pipe(filter(components => !!components));
  }

  constructor(
    @Inject(FORM_FLOW_COMPONENT_TOKEN)
    private readonly supportedCustomComponents: Array<FormFlowCustomComponentDefinition>
  ) {
    this.setSupportedComponents(supportedCustomComponents);
  }

  private setSupportedComponents(
    supportedComponents: Array<FormFlowCustomComponentDefinition>
  ): void {
    this._supportedComponents$.next(supportedComponents);
  }
}
