/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
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

import {Component, OnDestroy, ViewChild, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {TaskService} from '../task.service';
import moment from 'moment';
import {Task, TaskList} from '../models';
import {NGXLogger} from 'ngx-logger';
import {TaskDetailModalComponent} from '../task-detail-modal/task-detail-modal.component';
import {TranslateService} from '@ngx-translate/core';
import {combineLatest, Subscription} from 'rxjs';
import {SortState} from '@valtimo/config';

moment.locale(localStorage.getItem('langKey') || '');

@Component({
  selector: 'valtimo-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TaskListComponent implements OnDestroy {
  @ViewChild('taskDetail') taskDetail: TaskDetailModalComponent;
  public tasks = {
    mine: new TaskList(),
    open: new TaskList(),
    all: new TaskList(),
  };
  public currentTaskType = 'mine';
  public listTitle: string | null = null;
  public listDescription: string | null = null;
  public sortState: SortState | null = null;
  private translationSubscription: Subscription;

  public paginationClicked(page: number, type: string) {
    this.tasks[type].page = page - 1;
    this.getTasks(type);
  }

  constructor(
    private taskService: TaskService,
    private router: Router,
    private logger: NGXLogger,
    private translateService: TranslateService
  ) {
    this.setDefaultSorting();
  }

  paginationSet() {
    this.tasks.mine.pagination.size =
      this.tasks.all.pagination.size =
      this.tasks.open.pagination.size =
        this.tasks[this.currentTaskType].pagination.size;
    this.getTasks(this.currentTaskType);
  }

  private clearPagination(type: string) {
    this.tasks[type].page = 0;
  }

  tabChange(tab) {
    this.clearPagination(this.currentTaskType);

    switch (tab.nextId) {
      case 1:
        this.getTasks('mine');
        break;
      case 2:
        this.getTasks('open');
        break;
      case 3:
        this.getTasks('all');
        break;
      default:
        this.logger.fatal('Unreachable case');
    }
  }

  showTask(task) {
    this.router.navigate(['tasks', task.id]);
  }

  getTasks(type: string) {
    let params: any;

    this.translationSubscription = combineLatest([
      this.translateService.stream(`task-list.${type}.title`),
      this.translateService.stream(`task-list.${type}.description`),
    ]).subscribe(([title, description]) => {
      this.listTitle = title;
      this.listDescription = description;
    });

    switch (type) {
      case 'mine':
        params = {
          page: this.tasks.mine.page,
          size: this.tasks.mine.pagination.size,
          filter: 'mine',
        };
        this.currentTaskType = 'mine';
        break;
      case 'open':
        params = {
          page: this.tasks.open.page,
          size: this.tasks.open.pagination.size,
          filter: 'open',
        };
        this.currentTaskType = 'open';
        break;
      case 'all':
        params = {page: this.tasks.all.page, size: this.tasks.open.pagination.size, filter: 'all'};
        this.currentTaskType = 'all';
        break;
      default:
        this.logger.fatal('Unreachable case');
    }

    if (this.sortState) {
      params.sort = this.getSortString(this.sortState);
    }

    this.taskService.queryTasks(params).subscribe((results: any) => {
      this.tasks[type].pagination.collectionSize = results.headers.get('x-total-count');
      this.tasks[type].tasks = results.body as Array<Task>;
      this.tasks[type].tasks.map((task: Task) => {
        task.created = moment(task.created).format('DD MMM YYYY HH:mm');
        if (task.due) {
          task.due = moment(task.due).format('DD MMM YYYY HH:mm');
        }
      });
      if (this.taskService.getConfigCustomTaskList()) {
        this.customTaskListFields(type);
      } else {
        this.defaultTaskListFields(type);
      }
    });
  }

  public defaultTaskListFields(type) {
    this.translationSubscription = combineLatest([
      this.translateService.stream(`task-list.fieldLabels.created`),
      this.translateService.stream(`task-list.fieldLabels.name`),
      this.translateService.stream(`task-list.fieldLabels.valtimoAssignee.fullName`),
      this.translateService.stream(`task-list.fieldLabels.due`),
    ]).subscribe(([created, name, assignee, due]) => {
      this.tasks[type].fields = [
        {
          key: 'created',
          label: created,
        },
        {
          key: 'name',
          label: name,
        },
        {
          key: 'valtimoAssignee.fullName',
          label: assignee,
        },
        {
          key: 'due',
          label: due,
        },
      ];
    });
  }

  public customTaskListFields(type) {
    const customTaskListFields = this.taskService.getConfigCustomTaskList().fields;

    this.translationSubscription = combineLatest(
      customTaskListFields.map(column =>
        this.translateService.stream(`task-list.fieldLabels.${column.translationKey}`)
      )
    ).subscribe(labels => {
      this.tasks[type].fields = customTaskListFields.map((column, index) => ({
        key: column.propertyName,
        label: labels[index],
        sortable: column.sortable,
        ...(column.viewType && {viewType: column.viewType}),
      }));
    });
  }

  public rowOpenTaskClick(task) {
    if (!task.endTime) {
      this.taskDetail.openTaskDetails(task);
    } else {
      return false;
    }
  }

  setDefaultSorting() {
    this.sortState = this.taskService.getConfigCustomTaskList()?.defaultSortedColumn || null;
  }

  public sortChanged(sortState: SortState) {
    this.sortState = sortState;
    this.getTasks(this.currentTaskType);
  }

  getSortString(sort: SortState): string {
    return `${sort.state.name},${sort.state.direction}`;
  }

  ngOnDestroy(): void {
    this.translationSubscription.unsubscribe();
  }
}
