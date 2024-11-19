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

import {Injectable, OnDestroy} from '@angular/core';
import {ProcessDefinition} from '@valtimo/process';
import {BehaviorSubject, filter, Observable, Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {isEqual} from 'lodash';
import {ProcessLink, ProcessLinkService} from '@valtimo/process-link';

@Injectable()
export class ProcessManagementEditorService implements OnDestroy {
  private readonly _selectionProcessDefinitionSubject$ =
    new BehaviorSubject<ProcessDefinition | null>(null);

  public get selectionProcessDefinition$(): Observable<ProcessDefinition> {
    return this._selectionProcessDefinitionSubject$.pipe(
      filter(selectedProcessDefinition => !!selectedProcessDefinition?.id),
      distinctUntilChanged((previous, current) => isEqual(previous, current))
    );
  }

  private readonly _processLinksForSelectedDefinition$ = new BehaviorSubject<ProcessLink[]>([]);

  public get processLinksForSelectedDefinition$(): Observable<ProcessLink[]> {
    return this._processLinksForSelectedDefinition$.asObservable();
  }

  public get processLinksForSelectedDefinition(): ProcessLink[] {
    return this._processLinksForSelectedDefinition$.getValue();
  }

  private readonly _processLinksFetchedForSelectedDefinition$ = new BehaviorSubject<boolean>(false);

  private readonly _subscriptions = new Subscription();

  public setSelectedProcessDefinition(definition: ProcessDefinition): void {
    this._selectionProcessDefinitionSubject$.next(definition);
  }

  constructor(private readonly processLinkService: ProcessLinkService) {
    this.openSelectedProcessDefinitionSubscription();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private openSelectedProcessDefinitionSubscription(): void {
    this._subscriptions.add(
      this.selectionProcessDefinition$.subscribe(definition => {
        this.fetchProcessLinksForDefinition(definition.id);
      })
    );
  }

  private fetchProcessLinksForDefinition(processDefinitionId: string): void {
    this.processLinkService.getProcessLink({processDefinitionId}).subscribe(res => {
      this._processLinksForSelectedDefinition$.next(res);
    });
  }
}
