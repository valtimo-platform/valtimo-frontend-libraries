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

import {Component, EventEmitter, Input, Output, ViewChild,} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FormioForm} from '@formio/angular';
import {FormioComponent, FormioOptionsImpl, FormioSubmission, ValtimoFormioOptions, ValtimoModalService} from '@valtimo/components';
import {FormFlowService, FormLinkService} from '../../services';
import {FormFlowInstance, FormFlowStepType} from '../../models';

@Component({
  selector: 'valtimo-form-flow',
  templateUrl: './form-flow.component.html',
  styleUrls: ['./form-flow.component.css'],
})
export class FormFlowComponent {
  @ViewChild('form') form: FormioComponent;
  @Input() formIoFormData: BehaviorSubject<any> | null = new BehaviorSubject<any>(null);
  @Input() formFlowInstanceId: string;
  @Output() formFlowComplete = new EventEmitter();

  formDefinition: FormioForm;
  formioOptions: ValtimoFormioOptions;
  formFlowStepType$ = new BehaviorSubject<FormFlowStepType | null>(null);

  private formFlowStepInstanceId: string;

  constructor(
    private readonly formLinkService: FormLinkService,
    private readonly formFlowService: FormFlowService,
    private readonly modalService: ValtimoModalService,
  ) {
    this.formioOptions = new FormioOptionsImpl();
    this.formioOptions.disableAlerts = true;
  }

  ngOnInit() {
    this.getFormFlowStep()
  }

  onChange(event: any): void {
    if (event.data) {
      this.formIoFormData.next(event.data);
    }
  }

  onSubmit(submission: FormioSubmission): void {
    if (submission.data) {
      this.formIoFormData.next(submission.data);
    }
    if (submission.data.submit) {
      this.formFlowService
        .submitStep(this.formFlowInstanceId, this.formFlowStepInstanceId, submission.data)
        .subscribe(
          (result: FormFlowInstance) => this.handleFormFlowStep(result),
          errors => this.form.showErrors(errors)
        );
    } else if (submission.data['back']) {
      this.formFlowService.back(this.formFlowInstanceId, submission.data).subscribe(
        (result: FormFlowInstance) => this.handleFormFlowStep(result),
        errors => this.form.showErrors(errors)
      );
    }
  }

  saveData(): void {
    const formIoFormData = this.formIoFormData.getValue();
    if (formIoFormData && this.formFlowInstanceId) {
      this.formFlowService.save(this.formFlowInstanceId, formIoFormData).subscribe(
        () => null,
        errors => this.form.showErrors(errors)
      );
    }
  }

  private getFormFlowStep(): void {
    this.formFlowService
      .getFormFlowStep(this.formFlowInstanceId)
      .subscribe((result: FormFlowInstance) => {
        this.handleFormFlowStep(result);
      });
  }

  private handleFormFlowStep(formFlowInstance: FormFlowInstance) {
    if (formFlowInstance.step === null) {
      this.formFlowStepType$.next(null);
      this.formFlowInstanceId = null;
      this.formFlowStepInstanceId = null;
      this.formFlowComplete.emit(null)
    } else {
      this.modalService.scrollToTop();
      this.formFlowStepType$.next(formFlowInstance.step.type);
      this.formFlowInstanceId = formFlowInstance.id;
      this.formFlowStepInstanceId = formFlowInstance.step.id;
      this.formDefinition = formFlowInstance.step.typeProperties.definition;
    }
  }
}
