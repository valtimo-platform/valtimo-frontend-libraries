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

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {Router} from '@angular/router';
import {TaskService} from '../../services/task.service';
import moment from 'moment';
import {Task, TaskListParams, TaskPageParams} from '../../models';
import {TaskDetailModalComponent} from '../task-detail-modal/task-detail-modal.component';
import {BehaviorSubject, combineLatest, Observable, of, switchMap, tap} from 'rxjs';
import {ConfigService, Page, SortState, TaskListTab} from '@valtimo/config';
import {DocumentService} from '@valtimo/document';
import {distinctUntilChanged, filter, map, take} from 'rxjs/operators';
import {PermissionService} from '@valtimo/access-control';
import {
  CAN_VIEW_CASE_PERMISSION,
  CAN_VIEW_TASK_PERMISSION,
  TASK_DETAIL_PERMISSION_RESOURCE,
} from '../../task-permissions';
import {TaskListColumnService, TaskListPaginationService, TaskListService} from '../../services';
import {isEqual} from 'lodash';
import {ListItem} from 'carbon-components-angular';
import {TranslateService} from '@ngx-translate/core';
import {TaskListSortService} from '../../services/task-list-sort.service';

moment.locale(localStorage.getItem('langKey') || '');

@Component({
  selector: 'valtimo-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TaskListService,
    TaskListColumnService,
    TaskListPaginationService,
    TaskListSortService,
  ],
})
export class TaskListComponent implements OnInit {
  @ViewChild('taskDetail') private readonly _taskDetail: TaskDetailModalComponent;

  public readonly selectedTaskType$ = this.taskListService.selectedTaskType$;
  public readonly fields$ = this.taskListColumnService.fields$;
  public readonly loadingTasks$ = new BehaviorSubject<boolean>(true);
  public readonly visibleTabs$ = new BehaviorSubject<Array<TaskListTab> | null>(null);

  private _enableLoadingAnimation$ = new BehaviorSubject<boolean>(true);

  public readonly cachedTasks$ = new BehaviorSubject<Task[] | null>(null);

  private readonly _ALL_CASES_ID = 'ALL_CASES';

  public readonly paginationForCurrentTaskTypeForList$ =
    this.taskListPaginationService.paginationForCurrentTaskTypeForList$;

  public readonly tasks$: Observable<Task[]> = combineLatest([
    this.taskListService.loadingStateForCaseDefinition$,
    this.selectedTaskType$,
    this.taskListPaginationService.paginationForCurrentTaskType$,
    this.taskListSortService.sortStringForCurrentTaskType$,
    this.taskListService.caseDefinitionName$,
    this._enableLoadingAnimation$,
  ]).pipe(
    filter(([loadingStateForCaseDefinition]) => loadingStateForCaseDefinition === false),
    map(
      ([
        _,
        selectedTaskType,
        paginationForSelectedTaskType,
        sortStringForSelectedTaskType,
        caseDefinitionName,
        enableLoadingAnimation,
      ]) =>
        this.getTaskListParams(
          paginationForSelectedTaskType,
          sortStringForSelectedTaskType,
          selectedTaskType,
          caseDefinitionName,
          enableLoadingAnimation
        )
    ),
    distinctUntilChanged((previous, current) => isEqual(previous.params, current.params)),
    tap(({enableLoadingAnimation}) => {
      if (enableLoadingAnimation) this.loadingTasks$.next(true);
    }),
    switchMap(({params}) =>
      this.taskService.queryTasksPageV3(
        params.selectedTaskType,
        params.params,
        params.caseDefinitionName
      )
    ),
    switchMap(tasksResult => this.getTaskListPermissionsRequest(tasksResult)),
    map(([taskResult, canViewTaskPermissions, canViewCasePermissions]) => {
      this.taskListPaginationService.updateTaskPagination(this.taskListService.selectedTaskType, {
        collectionSize: Number(taskResult.totalElements),
      });

      return this.mapTasksForList(taskResult, canViewTaskPermissions, canViewCasePermissions);
    }),
    tap(tasks => {
      this.cachedTasks$.next(tasks);
      this.loadingTasks$.next(false);
      this.disableLoadingAnimation();
    })
  );

  public readonly loadingCaseListItems$ = new BehaviorSubject<boolean>(true);
  private readonly _selectedCaseDefinitionId$ = new BehaviorSubject<string>(this._ALL_CASES_ID);
  public readonly caseListItems$: Observable<ListItem[]> = combineLatest([
    this.documentService.getAllDefinitions(),
    this._selectedCaseDefinitionId$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([documentDefinitionRes, selectedCaseDefinitionId]) => [
      {
        content: this.translateService.instant('task-list.allCases'),
        id: this._ALL_CASES_ID,
        selected: selectedCaseDefinitionId === this._ALL_CASES_ID,
      },
      ...documentDefinitionRes.content.map(documentDefinition => ({
        id: documentDefinition.id.name,
        content: documentDefinition?.schema?.title,
        selected: documentDefinition.id.name === selectedCaseDefinitionId,
      })),
    ]),
    tap(() => this.loadingCaseListItems$.next(false))
  );

  public readonly taskListColumnsForCase$ = this.taskListColumnService.taskListColumnsForCase$;

  constructor(
    private readonly configService: ConfigService,
    private readonly documentService: DocumentService,
    private readonly permissionService: PermissionService,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly taskListService: TaskListService,
    private readonly translateService: TranslateService,
    private readonly taskListColumnService: TaskListColumnService,
    private readonly taskListPaginationService: TaskListPaginationService,
    private readonly taskListSortService: TaskListSortService
  ) {}

  public ngOnInit(): void {
    this.taskListColumnService.resetTaskListFields();
    this.setVisibleTabs();
  }

  public paginationClicked(page: number, type: TaskListTab | string): void {
    this.taskListPaginationService.updateTaskPagination(type as TaskListTab, {page: page - 1});
  }

  public paginationSet(newSize: number): void {
    combineLatest([
      this.taskListPaginationService.paginationForCurrentTaskType$,
      this.taskListService.selectedTaskType$,
    ])
      .pipe(take(1))
      .subscribe(([pagination, selectedTaskType]) => {
        this.taskListPaginationService.updateTaskPagination(selectedTaskType, {
          size: Number(newSize),
          page: this.taskListPaginationService.getLastAvailablePage(
            pagination.page,
            Number(newSize),
            pagination.collectionSize
          ),
        });
      });
  }

  public tabChange(tab: TaskListTab | string): void {
    this.taskListService.selectedTaskType$.pipe(take(1)).subscribe(selectedTaskType => {
      if (selectedTaskType !== tab) {
        this.enableLoadingAnimation();
        this.taskListService.setSelectedTaskType(tab as TaskListTab);
        this.taskListPaginationService.updateTaskPagination(tab as TaskListTab, {page: 0});
      }
    });
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

  public rowOpenTaskClick(task): void | boolean {
    return !task.endTime && !task.locked ? this._taskDetail.openTaskDetails(task) : false;
  }

  public sortChanged(sortState: SortState): void {
    this.taskListSortService.updateSortState(this.taskListService.selectedTaskType, sortState);
  }

  public setCaseDefinition(definition: {item: {id: string}}): void {
    if (definition.item.id) {
      this.loadingTasks$.next(true);
      this.taskListService.setCaseDefinitionName(definition.item.id);
    }
  }

  private setVisibleTabs(): void {
    const visibleTabs = this.configService.config?.visibleTaskListTabs || null;
    this.visibleTabs$.next(visibleTabs);
    if (visibleTabs) this.taskListService.setSelectedTaskType(visibleTabs[0]);
  }

  private disableLoadingAnimation(): void {
    this._enableLoadingAnimation$.next(false);
  }

  private enableLoadingAnimation(): void {
    this._enableLoadingAnimation$.next(true);
  }

  private getTaskListParams(
    paginationForSelectedTaskType: TaskPageParams,
    sortStringForSelectedTaskType: string,
    selectedTaskType: TaskListTab,
    caseDefinitionName: string,
    enableLoadingAnimation: boolean
  ): TaskListParams {
    const params = {
      ...paginationForSelectedTaskType,
      ...(sortStringForSelectedTaskType && {sort: sortStringForSelectedTaskType}),
    };

    delete params.collectionSize;

    return {
      params: {
        selectedTaskType,
        params,
        ...(caseDefinitionName &&
          caseDefinitionName !== this._ALL_CASES_ID && {caseDefinitionName}),
      },
      enableLoadingAnimation,
    };
  }

  private getTaskListPermissionsRequest(tasksResult: Page<Task>) {
    const taskResults = tasksResult.content;
    const hasTaskResults = Array.isArray(taskResults) && taskResults.length > 0;

    return combineLatest([
      of(tasksResult),
      hasTaskResults
        ? combineLatest(
            taskResults.map(task =>
              this.permissionService.requestPermission(CAN_VIEW_TASK_PERMISSION, {
                resource: TASK_DETAIL_PERMISSION_RESOURCE.task,
                identifier: task.id,
              })
            )
          )
        : of(null),
      hasTaskResults
        ? combineLatest(
            taskResults.map(task =>
              this.permissionService.requestPermission(CAN_VIEW_CASE_PERMISSION, {
                resource: TASK_DETAIL_PERMISSION_RESOURCE.jsonSchemaDocument,
                identifier: task.businessKey,
              })
            )
          )
        : of(null),
    ]);
  }

  private mapTasksForList(
    tasks: Page<Task>,
    canViewTaskPermissions: boolean[] | null,
    canViewCasePermissions: boolean[] | null
  ): Task[] {
    return tasks?.content?.map((task, taskIndex) => {
      const createdDate = moment(task.created);
      const dueDate = moment(task.due);
      const taskCopy = {...task};

      if (task.due && dueDate.isValid()) taskCopy.due = dueDate.format('DD MMM YYYY HH:mm');
      if (createdDate.isValid()) taskCopy.created = createdDate.format('DD MMM YYYY HH:mm');
      if (canViewTaskPermissions) taskCopy.locked = !canViewTaskPermissions[taskIndex];
      if (canViewCasePermissions) taskCopy.caseLocked = !canViewCasePermissions[taskIndex];

      return taskCopy;
    });
  }
}
