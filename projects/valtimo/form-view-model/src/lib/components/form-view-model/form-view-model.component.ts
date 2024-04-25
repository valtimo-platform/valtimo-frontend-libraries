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
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import moment from 'moment';
import {BehaviorSubject, combineLatest, Subject, take} from 'rxjs';
import {
  FormioSubmission
} from '@formio/angular';
import {FormioRefreshValue} from '@formio/angular/formio.common';
import {FormioComponent as FormIoSourceComponent} from '@formio/angular/components/formio/formio.component';
import {ViewModelService} from '../../services';
moment.defaultFormat = 'DD MMM YYYY HH:mm';

@Component({
  selector: 'valtimo-form-view-model',
  templateUrl: './form-view-model.component.html',
  styleUrls: ['./form-view-model.component.css'],
})
export class FormViewModelComponent implements OnInit {

  @Input() set options(optionsValue: any) {
    this.options$.next(optionsValue);
  }
  @Input() set submission(submissionValue: FormioSubmission) {
    this.submission$.next(submissionValue);
  }
  @Input() set form(formValue: object) {
    const instance = this;
    const form = {
      loadInitialViewModel: () => instance.loadInitialViewModel(),
      updateViewModel: () => instance.updateViewModel(),
      ...formValue
    }
    this.form$.next(form);
  }
  @Input() set formDefinitionId(formDefinitionId: string) {
    this.formDefinitionId$.next(formDefinitionId);
  }
  @Input() set taskInstanceId(taskInstanceId: string) {
    this.taskInstanceId$.next(taskInstanceId);
  }
  @Input() set readOnly(readOnlyValue: boolean) {
    this.readOnly$.next(readOnlyValue);
  }
  @Input() formRefresh$!: Subject<FormioRefreshValue>;

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() submit = new EventEmitter<any>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() change = new EventEmitter<any>();

  public refreshForm = new EventEmitter<FormioRefreshValue>();

  public readonly submission$ = new BehaviorSubject<any>({});
  public readonly form$ = new BehaviorSubject<object>(undefined);
  public readonly options$ = new BehaviorSubject<any>(undefined);
  public readonly taskInstanceId$ = new BehaviorSubject<string>(undefined);
  public readonly formDefinitionId$ = new BehaviorSubject<string>(undefined);
  public readonly readOnly$ = new BehaviorSubject<boolean>(false);
  public readonly errors$ = new BehaviorSubject<Array<string>>([]);
  public readonly tokenSetInLocalStorage$ = new BehaviorSubject<boolean>(false);

  public readonly updating$ = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly viewModelService: ViewModelService
  ) {
  }

  ngOnInit() {
      this.loadInitialViewModel();
  }

  public onSubmit(submission: FormioSubmission): void {
    this.errors$.next([]);
    this.submit.emit(submission);
  }

  public formReady(form: FormIoSourceComponent): void {
  }

  public onChange(object: any): void {
    this.change.emit(object);
  }

  public loadInitialViewModel() {
    combineLatest([this.formDefinitionId$, this.taskInstanceId$]).pipe(take(1)).subscribe(([formId, taskInstanceId]) => {
      this.viewModelService.getViewModel(formId, taskInstanceId).subscribe(viewModel => {
        this.change.pipe(take(1)).subscribe(change => {
          this.updating$.next(false);
        })
        this.submission$.next(this.convertViewModelToSubmission(viewModel))
      })
    })
  }

  public updateViewModel() {
    this.updating$.pipe(take(1)).subscribe(updating => {
      if(!updating) {
        this.updating$.next(true)
        combineLatest([this.formDefinitionId$, this.taskInstanceId$, this.change]).pipe(take(1)).subscribe(([formId, taskInstanceId, change]) => {
          const viewModel = this.convertSubmissionToViewModel(change.data);
          this.viewModelService.updateViewModel(formId, taskInstanceId, viewModel).subscribe(viewModel => {
            const submission = this.convertViewModelToSubmission(viewModel, change.data);
            this.change.pipe(take(1)).subscribe(change => {
              this.updating$.next(false);
            })
            this.submission$.next(submission);
          })
        })
      }
    })
  }

  public convertSubmissionToViewModel(submission: any) {
    const viewModel: {[k: string]: any} = {};
    Object.keys(submission)
      .filter(key => key.startsWith("vm:"))
      .forEach(key => {
        const viewModelKey = key.replace('vm:', '');
        viewModel[viewModelKey] = submission[key]
      })
    return viewModel
  }

  public convertViewModelToSubmission(viewModel: any, existingSubmission?: any) {
    const submission: {[k: string]: any} = (typeof existingSubmission !== "undefined") ? existingSubmission : {};
    Object.keys(viewModel).forEach(key => submission['vm:'+key] = viewModel[key]);
    return {data: submission};
  }
}
