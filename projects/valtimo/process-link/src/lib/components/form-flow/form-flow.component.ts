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

import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {BehaviorSubject, map, Observable} from 'rxjs';
import {FormioForm} from '@formio/angular';
import {
  FormioComponent,
  FormioOptionsImpl,
  FormioSubmission,
  ValtimoFormioOptions,
  ValtimoModalService,
} from '@valtimo/components';
import {FormFlowService} from '../../services';
import {FormFlowBreadcrumbs, FormFlowInstance, FormFlowStepType} from '../../models';
import {TranslateService} from '@ngx-translate/core';
import {Step} from 'carbon-components-angular';

@Component({
  selector: 'valtimo-form-flow',
  templateUrl: './form-flow.component.html',
  styleUrls: ['./form-flow.component.scss'],
})
export class FormFlowComponent implements OnInit {
  @ViewChild('form') form: FormioComponent;
  @Input() formIoFormData: BehaviorSubject<any> | null = new BehaviorSubject<any>(null);
  @Input() formFlowInstanceId: string;
  @Output() formFlowComplete = new EventEmitter();

  public steps$: Observable<Step[]>;

  public readonly disabled$ = new BehaviorSubject<boolean>(false);
  public readonly formFlowStepType$ = new BehaviorSubject<FormFlowStepType | null>(null);
  public readonly FormFlowCustomComponentId$ = new BehaviorSubject<string>('');
  public readonly currentStepIndex$ = new BehaviorSubject<number>(0);

  formDefinition: FormioForm;
  formioOptions: ValtimoFormioOptions;

  formFlowStepInstanceId: string;

  constructor(
    private readonly formFlowService: FormFlowService,
    private readonly modalService: ValtimoModalService,
    private readonly translateService: TranslateService
  ) {
    this.formioOptions = new FormioOptionsImpl();
    this.formioOptions.disableAlerts = true;
  }

  public ngOnInit() {
    this.getFormFlowStep();
    this.getSteps();
  }

  public onChange(event: any): void {
    if (event?.data) {
      console.log('Event: ', event);
      this.formIoFormData.next(event.data);
    }
  }

  public onSubmit(submission: FormioSubmission): void {
    this.disable();

    if (submission.data) {
      this.formIoFormData.next(submission.data);
    }
    if (submission.data.submit) {
      this.formFlowService
        .submitStep(
          this.formFlowInstanceId,
          this.formFlowStepInstanceId,
          this.formIoFormData.getValue()
        )
        .subscribe(
          (result: FormFlowInstance) => {
            this.handleFormFlowStep(result);
          },
          errors => {
            this.form?.showErrors(errors);
            this.enable();
          }
        );
    } else if (submission.data['back']) {
      this.back(submission.data);
    }
  }

  public onEvent(submission: any): void {
    if (submission.data['back'] || submission.type == 'back') {
      this.back(submission.data);
    }
  }

  public saveData(): void {
    const formIoFormDataValue = this.formIoFormData.getValue();
    if (formIoFormDataValue && this.formFlowInstanceId) {
      this.formFlowService.save(this.formFlowInstanceId, formIoFormDataValue).subscribe(
        () => null,
        errors => this.form.showErrors(errors)
      );
    }
  }

  public onStepSelected(event: {step: {stepInstanceId: string}; index: number}): void {
    this.disable();
    this.currentStepIndex$.next(event.index);
    const submissionData = this.formIoFormData.getValue().data;
    this.formFlowService
      .navigateToStep(
        this.formFlowInstanceId,
        this.formFlowStepInstanceId,
        event.step.stepInstanceId,
        submissionData
      )
      .subscribe(
        (result: FormFlowInstance) => this.handleFormFlowStep(result),
        errors => {
          this.form?.showErrors(errors);
          this.enable();
        }
      );
  }

  private getSteps(): void {
    this.steps$ = this.formFlowService.getBreadcrumbs(this.formFlowInstanceId).pipe(
      map((breadcrumbs: FormFlowBreadcrumbs) => {
        this.currentStepIndex$.next(breadcrumbs.currentStepIndex);
        return breadcrumbs.breadcrumbs.map(breadcrumb => ({
          label: breadcrumb.title ?? breadcrumb.key,
          disabled: breadcrumb.stepInstanceId === null,
          complete: breadcrumb.completed,
          stepInstanceId: breadcrumb.stepInstanceId,
        }));
      })
    );
  }

  private getFormFlowStep(): void {
    this.formFlowService
      .getFormFlowStep(this.formFlowInstanceId)
      .subscribe((result: FormFlowInstance) => {
        this.handleFormFlowStep(result);
      });
  }

  private back(submissionData: any): void {
    this.formFlowService.back(this.formFlowInstanceId, submissionData).subscribe(
      (result: FormFlowInstance) => this.handleFormFlowStep(result),
      errors => {
        this.form?.showErrors(errors);
        this.enable();
      }
    );
  }

  private handleFormFlowStep(formFlowInstance: FormFlowInstance) {
    if (formFlowInstance.step === null) {
      this.formFlowStepType$.next(null);
      this.FormFlowCustomComponentId$.next('');
      this.formFlowInstanceId = null;
      this.formFlowStepInstanceId = null;
      this.formFlowComplete.emit(null);
    } else {
      this.getSteps();
      this.modalService.scrollToTop();
      this.formFlowStepType$.next(formFlowInstance.step.type);
      this.FormFlowCustomComponentId$.next(formFlowInstance?.step?.typeProperties?.id || '');
      this.formFlowInstanceId = formFlowInstance.id;
      this.formFlowStepInstanceId = formFlowInstance.step.id;
      this.formDefinition = formFlowInstance.step.typeProperties.definition;
    }

    this.enable();
  }

  private disable(): void {
    this.disabled$.next(true);
  }

  private enable(): void {
    this.disabled$.next(false);
  }
}
