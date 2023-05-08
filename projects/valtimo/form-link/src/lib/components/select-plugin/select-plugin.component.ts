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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {PluginDefinition, PluginManagementService} from '@valtimo/plugin';
import {ProcessLinkStateService} from '../../services/process-link-state.service';
import {Subscription} from 'rxjs';
import {ProcessLinkButtonService, ProcessLinkState2Service} from '../../services';

@Component({
  selector: 'valtimo-select-plugin',
  templateUrl: './select-plugin.component.html',
  styleUrls: ['./select-plugin.component.scss'],
})
export class SelectPluginComponent implements OnInit, OnDestroy {
  readonly pluginDefinitions$ = this.pluginManagementService.getPluginDefinitions();
  readonly selectedPluginDefinition$ = this.processLinkStateService.selectedPluginDefinition$;

  private _subscriptions = new Subscription();

  constructor(
    private readonly pluginManagementService: PluginManagementService,
    private readonly processLinkStateService: ProcessLinkStateService,
    private readonly buttonService: ProcessLinkButtonService,
    private readonly stateService: ProcessLinkState2Service
  ) {}

  ngOnInit(): void {
    this.openBackButtonSubscription();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  selectPlugin(pluginDefinition: PluginDefinition): void {
    this.processLinkStateService.selectPluginDefinition(pluginDefinition);
  }

  deselectPlugin(): void {
    this.processLinkStateService.deselectPluginDefinition();
  }

  private openBackButtonSubscription(): void {
    this._subscriptions.add(
      this.buttonService.backButtonClick$.subscribe(() => {
        this.stateService.setInitial();
      })
    );
  }
}
