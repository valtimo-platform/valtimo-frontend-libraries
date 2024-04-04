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
import {ColumnConfig, ViewType} from '@valtimo/components';
import {BehaviorSubject, filter, Observable, switchMap} from 'rxjs';
import {TaskService} from './task.service';
import {TaskListColumn} from '../models';
import {TaskListService} from './task-list.service';

@Injectable()
export class TaskListColumnService {
  private readonly _DEFAULT_TASK_LIST_FIELDS: ColumnConfig[] = [
    {
      key: 'created',
      label: `task-list.fieldLabels.created`,
      viewType: ViewType.TEXT,
      sortable: true,
    },
    {
      key: 'name',
      label: `task-list.fieldLabels.name`,
      viewType: ViewType.TEXT,
      sortable: true,
    },
    {
      key: 'valtimoAssignee.fullName',
      label: `task-list.fieldLabels.valtimoAssignee.fullName`,
      viewType: ViewType.TEXT,
    },
    {
      key: 'due',
      label: `task-list.fieldLabels.due`,
      viewType: ViewType.TEXT,
      sortable: true,
    },
    {
      key: 'context',
      label: `task-list.fieldLabels.context`,
      viewType: ViewType.TEXT,
    },
  ];

  private readonly _fields$ = new BehaviorSubject<ColumnConfig[]>(this._DEFAULT_TASK_LIST_FIELDS);

  private get hasCustomConfigTaskList(): boolean {
    return !!this.taskService.getConfigCustomTaskList();
  }

  public get fields$(): Observable<ColumnConfig[]> {
    return this._fields$.asObservable();
  }

  public get taskListColumnsForCase$(): Observable<TaskListColumn[]> {
    return this.taskListService.caseDefinitionName$.pipe(
      filter(caseDefinitionName => !!caseDefinitionName),
      switchMap(caseDefinitionName => this.taskService.getTaskListColumns(caseDefinitionName))
    );
  }

  constructor(
    private readonly taskService: TaskService,
    private readonly taskListService: TaskListService
  ) {}

  public resetTaskListFields(): void {
    if (this.hasCustomConfigTaskList) {
      this.setFieldsToCustomTaskListFields();
    } else {
      this.setFieldsToDefaultTaskListFields();
    }
  }

  private setFieldsToCustomTaskListFields(): void {
    const customTaskListFields = this.taskService.getConfigCustomTaskList().fields;

    if (customTaskListFields) {
      this._fields$.next(
        customTaskListFields.map((column, index) => ({
          key: column.propertyName,
          label: `task-list.fieldLabels.${column.translationKey}`,
          sortable: column.sortable,
          ...(column.viewType && {viewType: column.viewType}),
          ...(column.enum && {enum: column.enum}),
        }))
      );
    }
  }

  private setFieldsToDefaultTaskListFields(): void {
    this._fields$.next(this._DEFAULT_TASK_LIST_FIELDS);
  }

  private mapTaskListColumnToColumnConfig(
    taskListColumns: Array<TaskListColumn>
  ): Array<ColumnConfig> {
    return taskListColumns.map(taskListColumn => ({
      label: taskListColumn.key,
      sortable: taskListColumn.sortable,
      default: taskListColumn.defaultSort,
      viewType: this.getViewType(taskListColumn.displayType.type),
      key: this.getPropertyName(taskListColumn.path),
      ...(taskListColumn.title && {title: taskListColumn.title}),
      ...(taskListColumn?.displayType?.displayTypeParameters?.enum && {
        enum: taskListColumn.displayType.displayTypeParameters.enum as any,
      }),
      ...(taskListColumn.displayType?.displayTypeParameters?.dateFormat && {
        format: taskListColumn.displayType?.displayTypeParameters?.dateFormat,
      }),
    }));
  }

  private getViewType(taskListColumnColumnDisplayType: string): string {
    switch (taskListColumnColumnDisplayType) {
      case 'arrayCount':
        return 'relatedFiles';
      case 'underscoresToSpaces':
        return 'stringReplaceUnderscore';
      default:
        return taskListColumnColumnDisplayType;
    }
  }

  private getPropertyName(caseListColumnPath: string): string {
    return caseListColumnPath.replace('doc:', '$.').replace('case:', '');
  }
}
