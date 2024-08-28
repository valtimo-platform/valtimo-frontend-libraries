import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {Router} from '@angular/router';
import {RecentlyViewed16} from '@carbon/icons';
import {FormioForm} from '@formio/angular';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {PermissionService} from '@valtimo/access-control';
import {
  FormioComponent,
  FormIoModule,
  FormioOptionsImpl,
  FormIoStateService,
  FormioSubmission,
  ValtimoFormioOptions,
} from '@valtimo/components';
import {FORM_VIEW_MODEL_TOKEN, FormViewModel} from '@valtimo/config';
import {DocumentService} from '@valtimo/document';
import {FormFlowComponent, FormSubmissionResult, ProcessLinkService} from '@valtimo/process-link';
import {IconService} from 'carbon-components-angular';
import moment from 'moment';
import {NGXLogger} from 'ngx-logger';
import {ToastrService} from 'ngx-toastr';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import {IntermediateSubmission, Task, TaskProcessLinkType} from '../../models';
import {TaskIntermediateSaveService, TaskService} from '../../services';
import {CAN_ASSIGN_TASK_PERMISSION, TASK_DETAIL_PERMISSION_RESOURCE} from '../../task-permissions';

@Component({
  selector: 'valtimo-task-detail-content',
  templateUrl: './task-detail-content.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormIoModule, TranslateModule],
})
export class TaskDetailContentComponent implements OnInit, OnDestroy {
  @ViewChild('form') form: FormioComponent;
  @ViewChild('formViewModelComponent', {static: true, read: ViewContainerRef})
  public formViewModelDynamicContainer: ViewContainerRef;
  @ViewChild('formFlow') public formFlow: FormFlowComponent;
  @Output() formSubmit = new EventEmitter();
  @Output() closeModalEvent = new EventEmitter();

  public readonly canAssignUserToTask$ = new BehaviorSubject<boolean>(false);
  public readonly errorMessage$ = new BehaviorSubject<string | null>(null);
  public readonly formDefinition$ = new BehaviorSubject<FormioForm | null>(null);
  public readonly formDefinitionId$ = new BehaviorSubject<string | null>(null);
  public readonly formFlowInstanceId$ = new BehaviorSubject<string | null>(null);
  public readonly formioOptions$ = new BehaviorSubject<ValtimoFormioOptions | null>(null);
  public readonly formIoFormData$ = new BehaviorSubject<any>(null);
  public readonly formName$ = new BehaviorSubject<string | null>(null);
  public readonly loading$ = new BehaviorSubject<boolean>(true);
  public readonly page$ = new BehaviorSubject<any>(null);
  public readonly submission$ = new BehaviorSubject<any>({});
  public readonly task$ = new BehaviorSubject<Task | null>(null);
  public readonly taskInstanceId$ = new BehaviorSubject<string | null>(null);
  public intermediateSaveEnabled = false;
  public currentIntermediateSave: IntermediateSubmission | null = null;

  private readonly _taskProcessLinkType$ = new BehaviorSubject<TaskProcessLinkType | null>(null);
  public readonly processLinkIsForm$ = this._taskProcessLinkType$.pipe(
    map((type: string | null) => type === 'form')
  );
  public readonly processLinkIsFormViewModel$ = this._taskProcessLinkType$.pipe(
    map((type: string | null) => type === 'form-view-model')
  );
  public readonly processLinkIsFormFlow$ = this._taskProcessLinkType$.pipe(
    map((type: string | null) => type === 'form-flow')
  );

  private readonly _processLinkId$ = new BehaviorSubject<string | null>(null);
  private readonly _subscriptions = new Subscription();

  constructor(
    private readonly documentService: DocumentService,
    private readonly iconService: IconService,
    private readonly logger: NGXLogger,
    private readonly permissionService: PermissionService,
    private readonly processLinkService: ProcessLinkService,
    private readonly router: Router,
    private readonly stateService: FormIoStateService,
    private readonly taskIntermediateSaveService: TaskIntermediateSaveService,
    private readonly taskService: TaskService,
    private readonly toastr: ToastrService,
    private readonly translateService: TranslateService,
    @Optional() @Inject(FORM_VIEW_MODEL_TOKEN) private readonly formViewModel: FormViewModel
  ) {
    this.iconService.registerAll([RecentlyViewed16]);

    const options = new FormioOptionsImpl();
    options.disableAlerts = true;
    this.formioOptions$.next(options);
  }

  public ngOnInit(): void {
    this.openPermissionSubscription();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public onSubmit(submission: FormioSubmission): void {
    if (submission.data) {
      this.formIoFormData$.next(submission.data);
    }

    combineLatest([this._processLinkId$, this._taskProcessLinkType$, this.task$])
      .pipe(take(1))
      .subscribe(([processLinkId, taskProcessLinkType, task]) => {
        if (taskProcessLinkType === 'form') {
          if (processLinkId) {
            this.processLinkService
              .submitForm(processLinkId, submission.data, task?.businessKey, task?.id)
              .subscribe({
                next: (_: FormSubmissionResult) => {
                  this.completeTask(task);
                },
                error: errors => {
                  this.form.showErrors(errors);
                },
              });
          }
        } else if (taskProcessLinkType === 'form-view-model') {
          this.completeTask(task);
        }
      });
  }

  public completeTask(task: Task | null): void {
    if (!task) return;

    this.toastr.success(
      `${task.name} ${this.translateService.instant('taskDetail.taskCompleted')}`
    );
    this.task$.next(null);
    this.formSubmit.emit();
    this.closeModalEvent.emit();

    if (this.formFlow) this.formFlow.saveData();
    // closeModal
  }

  public onChange(event: any): void {
    if (event.data) {
      this.formIoFormData$.next(event.data);
    }
  }

  public openTaskDetails(task: Task): void {
    this.resetTaskProcessLinkType();
    this.resetFormDefinition();
    this.getTaskProcessLink(task.id);
    this.setDocumentDefinitionNameInService(task);
    const documentId = task.businessKey;
    this.stateService.setDocumentId(documentId);

    this.task$.next(task);
    this.taskInstanceId$.next(task.id);
    this.page$.next({
      title: task.name,
      subtitle: `${this.translateService.instant('taskDetail.taskCreated')} ${task.created}`,
    });

    //only load from formlink when process link failed for backwards compatibility
    // if (!this.taskProcessLinkType$.getValue()) {
    //   this.openModal();
    // }
  }

  public gotoProcessLinkScreen(): void {
    //closeModal
    this.closeModalEvent.emit();
    if (this.formFlow) this.formFlow.saveData();
    this.router.navigate(['process-links']);
  }

  private getCurrentProgress(formViewModelComponentRef?: ComponentRef<any>): void {
    this.taskInstanceId$
      .pipe(
        take(1),
        switchMap((taskInstanceId: string | null) =>
          this.taskIntermediateSaveService.getIntermediateSubmission(taskInstanceId ?? '')
        )
      )
      .subscribe({
        next: (intermediateSubmission: IntermediateSubmission) => {
          this.submission$.next({data: intermediateSubmission.submission});
          this.currentIntermediateSave = this.formatIntermediateSubmission(intermediateSubmission);

          if (formViewModelComponentRef) {
            formViewModelComponentRef.instance.submission = {
              data: intermediateSubmission.submission,
            };
          }
        },
      });
  }

  private getTaskProcessLink(taskId: string): void {
    this.taskService.getTaskProcessLink(taskId).subscribe({
      next: res => {
        if (res != null) {
          switch (res?.type) {
            case 'form':
              this._taskProcessLinkType$.next('form');
              this._processLinkId$.next(res.processLinkId);
              if (this.intermediateSaveEnabled) this.getCurrentProgress();
              this.setFormDefinitionAndOpenModal(res.properties.prefilledForm);
              break;
            case 'form-flow':
              this._taskProcessLinkType$.next('form-flow');
              this.formFlowInstanceId$.next(res.properties.formFlowInstanceId ?? '');
              break;
            case 'form-view-model':
              this._taskProcessLinkType$.next('form-view-model');
              this._processLinkId$.next(res.processLinkId);
              this.formDefinition$.next(res.properties.formDefinition);
              this.formName$.next(res.properties.formName ?? '');
              // this.openModal();
              this.setFormViewModelComponent();
              break;
          }
          this.loading$.next(false);
        }
      },
      error: _ => {
        this.loading$.next(false);
      },
    });
  }

  private formatIntermediateSubmission(
    intermediateSubmission: IntermediateSubmission
  ): IntermediateSubmission {
    intermediateSubmission.createdOn = moment(intermediateSubmission.createdOn).format(
      'DD MMM YYYY HH:mm'
    );
    if (intermediateSubmission.editedOn) {
      intermediateSubmission.editedOn = moment(new Date(intermediateSubmission.editedOn)).format(
        'DD MMM YYYY HH:mm'
      );
    }

    return intermediateSubmission;
  }

  private openPermissionSubscription(): void {
    this._subscriptions.add(
      this.task$.subscribe(task => {
        if (task) {
          this.logger.debug('Checking if user allowed to assign a user to Task with id:', task.id);
          this.permissionService
            .requestPermission(CAN_ASSIGN_TASK_PERMISSION, {
              resource: TASK_DETAIL_PERMISSION_RESOURCE.task,
              identifier: task.id,
            })
            .subscribe((allowed: boolean) => {
              console.log({allowed});
              this.canAssignUserToTask$.next(allowed);
            });
        } else {
          this.logger.debug('Reset is user allowed to assign a user to Task as task is null');
          this.canAssignUserToTask$.next(false);
        }
      })
    );
  }

  private setFormDefinitionAndOpenModal(formDefinition: any): void {
    this._taskProcessLinkType$.next('form');
    this.formDefinition$.next(formDefinition);
  }

  private setFormViewModelComponent() {
    this.formViewModelDynamicContainer.clear();
    if (!this.formViewModel) return;
    const formViewModelComponent = this.formViewModelDynamicContainer.createComponent(
      this.formViewModel.component
    );
    formViewModelComponent.instance.form = this.formDefinition$.getValue();
    formViewModelComponent.instance.formName = this.formName$.getValue();
    formViewModelComponent.instance.taskInstanceId = this.taskInstanceId$.getValue();
    formViewModelComponent.instance.isStartForm = false;

    formViewModelComponent.instance.formSubmit
      .pipe(
        take(1),
        switchMap(() => this.task$)
      )
      .subscribe((task: Task | null) => {
        this.completeTask(task);
        // this.closeModal();
      });

    if (this.intermediateSaveEnabled) {
      this._subscriptions.add(
        formViewModelComponent.instance.submission$.subscribe(submission => {
          this.submission$.next(submission);
        })
      );
      this._subscriptions.add(
        this.submission$.pipe(distinctUntilChanged()).subscribe((submission?) => {
          if (submission?.data && Object.keys(submission.data).length === 0) {
            formViewModelComponent.instance.submission = {data: {}};
          }
        })
      );
      this.getCurrentProgress(formViewModelComponent);
    }
  }

  private resetFormDefinition(): void {
    this.formDefinition$.next(null);
    this.loading$.next(true);
  }

  private resetTaskProcessLinkType(): void {
    this._taskProcessLinkType$.next(null);
    this._processLinkId$.next(null);
  }

  private setDocumentDefinitionNameInService(task: Task): void {
    this.documentService
      .getProcessDocumentDefinitionFromProcessInstanceId(task.processInstanceId)
      .subscribe(processDocumentDefinition => {
        const documentDefinitionName = processDocumentDefinition.id.documentDefinitionId.name;
        // this.modalService.setDocumentDefinitionName(documentDefinitionName);
        this.stateService.setDocumentDefinitionName(documentDefinitionName);
      });
  }
}
