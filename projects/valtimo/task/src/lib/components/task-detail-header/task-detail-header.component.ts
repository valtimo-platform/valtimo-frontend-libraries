import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import {RecentlyViewed16} from '@carbon/icons';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ConfirmationModalModule} from '@valtimo/components';
import {ConfigService} from '@valtimo/config';
import {ButtonModule, IconModule, IconService, TooltipModule} from 'carbon-components-angular';
import {BehaviorSubject, take} from 'rxjs';
import {IntermediateSubmission, Task} from '../../models';
import {TaskService} from '../../services';

@Component({
  selector: 'valtimo-task-detail-header',
  templateUrl: './task-detail-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    TooltipModule,
    ConfirmationModalModule,
    IconModule,
  ],
})
export class TaskDetailHeaderComponent {
  @Input() public set task(value: Task | null) {
    if (!value) return;
    this.taskService
      .getTaskProcessLink(value.id)
      .pipe(take(1))
      .subscribe(res => {
        if (res !== null && res.type === 'form-flow')
          this.formFlowInstanceId$.next(res.properties.formFlowInstanceId);
      });

    this.page.set({
      title: value.name,
      subtitle: `${this.translateService.instant('taskDetail.taskCreated')} ${value.created}`,
    });
  }
  @Input() public set currentIntermediateSave(value: IntermediateSubmission | null) {
    this.currentIntermediateSaveValue.set(value);
  }
  @Output() public readonly assignmentOfTaskChanged = new EventEmitter();
  @Output() public readonly clearCurrentProgressEvent = new EventEmitter();
  @Output() public readonly saveCurrentProgressEvent = new EventEmitter();
  @Output() public readonly revertSaveEvent = new EventEmitter();

  public readonly formFlowInstanceId$ = new BehaviorSubject<string | undefined>(undefined);

  public readonly page = signal<{title: string; subtitle: string} | null>(null);
  public readonly canAssignUserToTask = signal<boolean>(false);

  public intermediateSaveEnabled = false;
  public currentIntermediateSaveValue = signal<IntermediateSubmission | null>(null);

  constructor(
    private readonly configService: ConfigService,
    private readonly iconService: IconService,
    private readonly translateService: TranslateService,
    private readonly taskService: TaskService
  ) {
    this.intermediateSaveEnabled = !!this.configService.featureToggles?.enableIntermediateSave;
    this.iconService.registerAll([RecentlyViewed16]);
  }

  public saveCurrentProgress(): void {
    this.saveCurrentProgressEvent.emit();
  }

  public clearCurrentProgress(): void {
    this.clearCurrentProgressEvent.emit();
  }

  public revertSaveClick(): void {
    this.revertSaveEvent.emit();
  }
}
