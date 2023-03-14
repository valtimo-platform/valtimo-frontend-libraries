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

import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ProcessInstanceTask, ProcessService} from '@valtimo/process';
import {ActivatedRoute, Router} from '@angular/router';
import {Document, DocumentService, ProcessDocumentInstance} from '@valtimo/document';
import {TaskDetailModalComponent, TaskService} from '@valtimo/task';
import {FormService} from '@valtimo/form';
import {FormioOptionsImpl, ValtimoFormioOptions} from '@valtimo/components';
import moment from 'moment';
import {FormioForm} from '@formio/angular';
import {BehaviorSubject, combineLatest, defaultIfEmpty, forkJoin, map, Observable, of, Subscription, switchMap} from 'rxjs';
import {SseService, TaskUpdateSseEvent} from '@valtimo/sse';
import {UserIdentity} from '@valtimo/config';
import {UserProviderService} from '@valtimo/security';

moment.locale(localStorage.getItem('langKey') || '');
moment.defaultFormat = 'DD MMM YYYY HH:mm';

@Component({
  selector: 'valtimo-dossier-detail-tab-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DossierDetailTabSummaryComponent implements OnInit, OnDestroy {
  public moment;
  public options: ValtimoFormioOptions;

  private _subscriptions = new Subscription();

  @ViewChild('taskDetail') taskDetail: TaskDetailModalComponent;

  readonly refreshTasks$ = new BehaviorSubject<null>(null);

  readonly documentId$: Observable<string> = this.route.params.pipe(
    map(params => params.documentId)
  );

  readonly documentDefinitionName$ = this.route.params.pipe(
    map(params => params.documentDefinitionName)
  );

  readonly formDefinition$: Observable<FormioForm> = combineLatest([this.documentId$, this.documentDefinitionName$]).pipe(
    switchMap(([documentId, documentDefinitionName]) =>
      this.formService.getFormDefinitionByNamePreFilled(`${documentDefinitionName}.summary`, documentId))
  )

  readonly document$: Observable<Document> = combineLatest([this.documentId$, this.refreshTasks$]).pipe(
    switchMap(([documentId]) => this.documentService.getDocument(documentId))
  );

  readonly roles$: Observable<string[]> = this.userProviderService.getUserSubject().pipe(
    map((userIdentity: UserIdentity) => userIdentity.roles)
  );

  readonly processDocumentInstances$: Observable<Array<ProcessDocumentInstance>> = this.documentId$.pipe(
    switchMap(documentId => this.documentService.findProcessDocumentInstances(documentId))
  );

  readonly tasks$: Observable<Array<ProcessInstanceTask>> = combineLatest([this.processDocumentInstances$, this.refreshTasks$]).pipe(
    switchMap(([processDocumentInstances]) => {
      if (processDocumentInstances.length === 0) {
        return of([]);
      }
      return forkJoin(
        processDocumentInstances.map(processDocumentInstance =>
          this.processService.getProcessInstanceTasks(processDocumentInstance.id.processInstanceId)
        )
      );
    }),
    map(response => response.filter(value => value != null)),
    map(response => {
      return response
        .reduce((acc, val) => {
          return acc.concat(val);
        }, [])
        .map((task: ProcessInstanceTask) => {
          task.createdUnix = this.moment(task.created).unix();
          task.created = this.moment(task.created).format('DD MMM YYYY HH:mm');
          task.isLocked = roles => {
            let locked = false;
            for (const link of task.identityLinks) {
              if (link.type === 'candidate' && link.groupId) {
                if (roles.includes(link.groupId)) {
                  locked = false;
                  break;
                }
              }
            }
            return locked;
          };
          return task;
        })
        .sort((t1, t2) => t2.createdUnix - t1.createdUnix);
    }),
    defaultIfEmpty([])
  );

  readonly sse = this.sseService.connect().onEvent<TaskUpdateSseEvent>('TASK_UPDATE', event => {
    this._subscriptions.add(
      this.processDocumentInstances$.subscribe(v => {
        if (v.map(s => s.id.processInstanceId).indexOf(event.processInstanceId) > -1) {
          this.refreshTasks();
        }
      })
    );
  });

  constructor(
    private router: Router,
    private documentService: DocumentService,
    private taskService: TaskService,
    private processService: ProcessService,
    private el: ElementRef,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private formService: FormService,
    private userProviderService: UserProviderService,
    private readonly sseService: SseService,
  ) {
    this.options = new FormioOptionsImpl();
    this.options.disableAlerts = true;
  }

  ngOnInit() {
    this.moment = moment;
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
    this.sse.disconnect();
    this.sse.offEvents('TASK_UPDATE');
  }

  public rowTaskClick(task: any): void {
    this.taskDetail.openTaskDetails(task);
  }

  public refreshTasks(): void {
    this.refreshTasks$.next(null);
  }
}
