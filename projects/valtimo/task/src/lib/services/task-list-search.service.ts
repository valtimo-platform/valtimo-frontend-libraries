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
import {ConfigService, SearchField} from '@valtimo/config';
import {BehaviorSubject, combineLatest, map, Observable, of, switchMap, tap} from 'rxjs';
import {TaskListService} from './task-list.service';
import {TaskListSearchField} from '../models';
import {TaskService} from './task.service';

@Injectable()
export class TaskListSearchService {
  private readonly _loadingSearchFields$ = new BehaviorSubject<boolean>(true);

  public readonly enableTaskFiltering$: Observable<boolean> =
    this.configService.getFeatureToggleObservable('enableTaskFiltering');

  public get loadingSearchFields$(): Observable<boolean> {
    return this._loadingSearchFields$.asObservable();
  }

  public readonly searchFields$: Observable<SearchField[]> = combineLatest([
    this.taskListService.caseDefinitionName$,
    this.enableTaskFiltering$,
  ]).pipe(
    tap(() => this._loadingSearchFields$.next(true)),
    switchMap(([caseDefinitionName, enableTaskFiltering]) =>
      caseDefinitionName && enableTaskFiltering
        ? this.taskService.getTaskListSearchFields(caseDefinitionName)
        : of([] as TaskListSearchField[])
    ),
    map(searchFields =>
      searchFields.map(searchField => {
        const fieldTypeLowerCase = searchField.fieldType?.toLowerCase();

        return {
          ...searchField,
          dataType: searchField.dataType?.toLowerCase(),
          fieldType: fieldTypeLowerCase === 'text_contains' ? 'single' : fieldTypeLowerCase,
          matchType: searchField?.matchType?.toLowerCase(),
        } as unknown as SearchField;
      })
    ),
    tap(fields => console.log(fields)),
    tap(() => this._loadingSearchFields$.next(false))
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly taskListService: TaskListService,
    private readonly taskService: TaskService
  ) {}
}
