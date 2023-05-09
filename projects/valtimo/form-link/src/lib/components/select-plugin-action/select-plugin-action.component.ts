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

import {Component} from '@angular/core';
import {switchMap} from 'rxjs/operators';
import {PluginFunction, PluginManagementService} from '@valtimo/plugin';
import {PluginStateService} from '../../services/plugin-state.service';
import {Observable, of} from 'rxjs';

@Component({
  selector: 'valtimo-select-plugin-action',
  templateUrl: './select-plugin-action.component.html',
  styleUrls: ['./select-plugin-action.component.scss'],
})
export class SelectPluginActionComponent {
  readonly pluginFunctions$: Observable<Array<PluginFunction> | undefined> =
    this.stateService.selectedPluginDefinition$.pipe(
      switchMap(selectedDefinition =>
        selectedDefinition
          ? this.pluginManagementService.getPluginFunctions(selectedDefinition.key)
          : of(undefined)
      )
    );
  readonly selectedPluginDefinition$ = this.stateService.selectedPluginDefinition$;
  readonly selectedPluginFunction$ = this.stateService.selectedPluginFunction$;

  constructor(
    private readonly pluginManagementService: PluginManagementService,
    private readonly stateService: PluginStateService
  ) {}

  selectFunction(pluginFunction: PluginFunction): void {
    this.stateService.selectPluginFunction(pluginFunction);
  }

  deselectFunction(): void {
    this.stateService.deselectPluginFunction();
  }
}
