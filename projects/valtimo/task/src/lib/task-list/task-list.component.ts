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

import {ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {TaskService} from '../services/task.service';
import moment from 'moment';
import {Task, TaskPageParams} from '../models';
import {TaskDetailModalComponent} from '../task-detail-modal/task-detail-modal.component';
import {BehaviorSubject, combineLatest, Observable, of, startWith, switchMap, tap} from 'rxjs';
import {ConfigService, SortState, TaskListTab} from '@valtimo/config';
import {DocumentService} from '@valtimo/document';
import {distinctUntilChanged, map, take} from 'rxjs/operators';
import {PermissionService} from '@valtimo/access-control';
import {
  CAN_VIEW_CASE_PERMISSION,
  CAN_VIEW_TASK_PERMISSION,
  TASK_DETAIL_PERMISSION_RESOURCE,
} from '../task-permissions';
import {TaskListService} from '../services';
import {isEqual} from 'lodash';
import {ColumnConfig, ViewType} from '@valtimo/components';

moment.locale(localStorage.getItem('langKey') || '');

@Component({
  selector: 'valtimo-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent {
  @ViewChild('taskDetail') private readonly _taskDetail: TaskDetailModalComponent;

  private readonly _DEFAULT_TASK_LIST_FIELDS = [
    {
      key: 'created',
      label: `task-list.fieldLabels.created`,
      viewType: ViewType.TEXT,
    },
    {
      key: 'name',
      label: `task-list.fieldLabels.valtimoAssignee.fullName`,
      viewType: ViewType.TEXT,
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
    },
    {
      key: 'context',
      label: `task-list.fieldLabels.context`,
      viewType: ViewType.TEXT,
    },
  ];

  public readonly fields$ = new BehaviorSubject<ColumnConfig[]>(this._DEFAULT_TASK_LIST_FIELDS);
  public readonly loadingTasks$ = new BehaviorSubject<boolean>(true);
  public readonly visibleTabs$ = new BehaviorSubject<Array<TaskListTab> | null>(null);

  private readonly _selectedTaskType$ = new BehaviorSubject<TaskListTab>(TaskListTab.MINE);
  public readonly selectedTaskType$ = this._selectedTaskType$.pipe(
    tap(type => {
      if (this.taskService.getConfigCustomTaskList()) {
        this.customTaskListFields();
      } else {
        this.defaultTaskListFields();
      }
    })
  );

  private readonly _reload$ = new BehaviorSubject<null | 'noAnimation'>(null);

  private readonly _pagination$ = new BehaviorSubject<{[key in TaskListTab]: TaskPageParams}>({
    [TaskListTab.ALL]: this.getDefaultPagination(),
    [TaskListTab.MINE]: this.getDefaultPagination(),
    [TaskListTab.OPEN]: this.getDefaultPagination(),
  });
  public readonly paginationForCurrentTaskType$ = combineLatest([
    this._selectedTaskType$,
    this._pagination$,
  ]).pipe(map(([selectedTaskType, pagination]) => pagination[selectedTaskType]));

  private readonly _sortState$ = new BehaviorSubject<{[key in TaskListTab]: SortState | null}>({
    [TaskListTab.ALL]: this.getDefaultSortState(),
    [TaskListTab.MINE]: this.getDefaultSortState(),
    [TaskListTab.OPEN]: this.getDefaultSortState(),
  });

  public readonly cachedTasks$ = new BehaviorSubject<Task[] | null>(null);
  public readonly tasks$: Observable<Task[]> = combineLatest([
    this._reload$,
    this.selectedTaskType$,
    this._pagination$,
    this._sortState$,
    this.taskListService.caseDefinitionName$,
  ]).pipe(
    map(([reload, selectedTaskType, pagination, sortState, caseDefinitionName]) => {
      const paginationParam = {...pagination[selectedTaskType]};
      delete paginationParam.collectionSize;
      const sortParams = sortState[selectedTaskType];
      const params = {
        ...paginationParam,
        ...(sortParams && {sort: this.getSortString(sortParams)}),
      };

      return {
        selectedTaskType,
        params,
        caseDefinitionName,
        reload,
      };
    }),
    distinctUntilChanged((previous, current) => isEqual(previous, current)),
    tap(({reload}) => {
      if (reload !== 'noAnimation') this.loadingTasks$.next(true);
    }),
    switchMap(({selectedTaskType, params, caseDefinitionName}) =>
      this.taskService.queryTasksPageV3(selectedTaskType, params, caseDefinitionName)
    ),
    switchMap(tasksResult =>
      combineLatest([
        this._selectedTaskType$,
        of(tasksResult),
        combineLatest(
          tasksResult?.content.map(task =>
            this.permissionService.requestPermission(CAN_VIEW_TASK_PERMISSION, {
              resource: TASK_DETAIL_PERMISSION_RESOURCE.task,
              identifier: task.id,
            })
          )
        ).pipe(startWith(null)),
        combineLatest(
          tasksResult?.content.map(task =>
            this.permissionService.requestPermission(CAN_VIEW_CASE_PERMISSION, {
              resource: TASK_DETAIL_PERMISSION_RESOURCE.jsonSchemaDocument,
              identifier: task.businessKey,
            })
          )
        ).pipe(startWith(null)),
      ])
    ),
    map(([selectedTaskType, taskResult, canViewTaskPermissions, canViewCasePermissions]) => {
      this.updateTaskPagination(selectedTaskType, {collectionSize: taskResult.totalElements});

      return taskResult?.content?.map((task, taskIndex) => {
        if (task.due) task.due = moment(task.due).format('DD MMM YYYY HH:mm');
        task.created = moment(task.created).format('DD MMM YYYY HH:mm');
        if (canViewTaskPermissions) task.locked = !canViewTaskPermissions[taskIndex];
        if (canViewCasePermissions) task.caseLocked = !canViewCasePermissions[taskIndex];
        return task;
      });
    }),
    tap(tasks => {
      this.cachedTasks$.next(tasks);
      this.loadingTasks$.next(false);
    })
  );

  constructor(
    private readonly configService: ConfigService,
    private readonly documentService: DocumentService,
    private readonly permissionService: PermissionService,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly taskListService: TaskListService
  ) {
    this.setVisibleTabs();
  }

  public paginationClicked(page: number, type: TaskListTab | string): void {
    this.updateTaskPagination(type as TaskListTab, {page});
  }

  public paginationSet(size: number): void {
    this.updateTaskPaginationForAll({size});
  }

  public tabChange(tab: TaskListTab | string): void {
    this._selectedTaskType$.next(tab as TaskListTab);
    this.updateTaskPagination(tab as TaskListTab, {page: 0});
  }

  public showTask(task: Task): void {
    this.router.navigate(['tasks', task.id]);
  }

  public openRelatedCase(event: MouseEvent, index: number): void {
    event.stopPropagation();

    this.cachedTasks$.pipe(take(1)).subscribe(cachedTasks => {
      const currentTask = cachedTasks && cachedTasks[index];

      if (currentTask && !currentTask.caseLocked) {
        this.documentService
          .getDocument(currentTask.businessKey)
          .pipe(take(1))
          .subscribe(document => {
            this.router.navigate([
              `/dossiers/${document.definitionId?.name}/document/${currentTask.businessKey}`,
            ]);
          });
      }
    });
  }

  public defaultTaskListFields(): void {
    this.fields$.next(this._DEFAULT_TASK_LIST_FIELDS);
  }

  public customTaskListFields(): void {
    const customTaskListFields = this.taskService.getConfigCustomTaskList().fields;

    if (customTaskListFields) {
      this.fields$.next(
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

  public rowOpenTaskClick(task): void | boolean {
    if (!task.endTime && !task.locked) {
      this._taskDetail.openTaskDetails(task);
    } else {
      return false;
    }
  }

  public sortChanged(sortState: SortState): void {
    this._selectedTaskType$.pipe(take(1)).subscribe(selectedTaskType => {
      this.updateSortState(selectedTaskType, sortState);
    });
  }

  public reload(animation = true): void {
    this._reload$.next(animation ? null : 'noAnimation');
  }

  private getSortString(sort: SortState): string {
    return `${sort.state.name},${sort.state.direction}`;
  }

  private getDefaultSortState(): SortState | null {
    return this.taskService.getConfigCustomTaskList()?.defaultSortedColumn || null;
  }

  private getDefaultPagination(): TaskPageParams {
    return {
      page: 0,
      size: 10,
    };
  }

  private setVisibleTabs(): void {
    const visibleTabs = this.configService.config?.visibleTaskListTabs || null;
    this.visibleTabs$.next(visibleTabs);
    if (visibleTabs) this._selectedTaskType$.next(visibleTabs[0]);
  }

  private updateTaskPagination(
    taskType: TaskListTab,
    updatedPagination: Partial<TaskPageParams>
  ): void {
    this._pagination$.pipe(take(1)).subscribe(pagination => {
      const currentPagination = pagination[taskType];
      this._pagination$.next({
        ...pagination,
        [taskType]: {...currentPagination, ...updatedPagination},
      });
    });
  }

  private updateTaskPaginationForAll(updatedPagination: Partial<TaskPageParams>): void {
    this._pagination$.pipe(take(1)).subscribe(pagination => {
      this._pagination$.next({
        [TaskListTab.ALL]: {...pagination[TaskListTab.ALL], ...updatedPagination},
        [TaskListTab.MINE]: {...pagination[TaskListTab.MINE], ...updatedPagination},
        [TaskListTab.OPEN]: {...pagination[TaskListTab.OPEN], ...updatedPagination},
      });
    });
  }

  private updateSortState(taskType: TaskListTab, updatedSortState: SortState): void {
    this._sortState$.pipe(take(1)).subscribe(sortState => {
      this._sortState$.next({
        ...sortState,
        [taskType]: {...sortState[taskType], ...updatedSortState},
      });
    });
  }
}
