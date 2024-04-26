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
import {BehaviorSubject, catchError, combineLatest, filter, Observable, Subject, take, throwError, windowCount} from 'rxjs';
import {
  FormioOptions,
  FormioSubmission, FormioSubmissionCallback
} from '@formio/angular';
import {FormioRefreshValue} from '@formio/angular/formio.common';
import {FormioComponent as FormIoSourceComponent} from '@formio/angular/components/formio/formio.component';
import {ViewModelService} from '../../services';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
import {deepmerge} from 'deepmerge-ts';
import {FormIoStateService, ValtimoFormioOptions} from '@valtimo/components';
import {TranslateService} from '@ngx-translate/core';
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
  @Output() submit = new EventEmitter<any>();

  public refreshForm = new EventEmitter<FormioRefreshValue>();

  public readonly submission$ = new BehaviorSubject<any>({});
  public readonly form$ = new BehaviorSubject<object>(undefined);
  public readonly options$ = new BehaviorSubject<ValtimoFormioOptions>(undefined);
  public readonly taskInstanceId$ = new BehaviorSubject<string>(undefined);
  public readonly formDefinitionId$ = new BehaviorSubject<string>(undefined);
  public readonly readOnly$ = new BehaviorSubject<boolean>(false);
  public readonly tokenSetInLocalStorage$ = new BehaviorSubject<boolean>(false);
  public readonly change$ = new BehaviorSubject<any>(null);
  public readonly errors$ = new BehaviorSubject<Array<string>>([]);

  public readonly updating$ = new BehaviorSubject<boolean>(true);


  public readonly currentLanguage$ = this.translateService.stream('key').pipe(
    map(() => this.translateService.currentLang),
    distinctUntilChanged()
  );

  private readonly _overrideOptions$ = new BehaviorSubject<FormioOptions>({
    hooks: {
      beforeSubmit: this.beforeSubmitHook(this)
    }
  });
  public readonly formioOptions$: Observable<ValtimoFormioOptions | FormioOptions> = combineLatest([
    this.currentLanguage$,
    this.options$,
    this._overrideOptions$,
  ]).pipe(
    map(([language, options, overrideOptions]) => {
      const formioTranslations = this.translateService.instant('formioTranslations');

      const defaultOptions = {
        ...options,
        language,
        ...(formioTranslations === 'object' && {
          i18n: {
            [language]: this.stateService.flattenTranslationsObject(formioTranslations),
          },
        }),
      };

      return deepmerge(defaultOptions, overrideOptions);
    }),
    tap(options => console.log('Form.IO options used', options))
  );

  constructor(
    private readonly viewModelService: ViewModelService,
    private readonly translateService: TranslateService,
    private readonly stateService: FormIoStateService
  ) {
  }

  ngOnInit() {
      this.loadInitialViewModel();
  }

  public beforeSubmitHook(instance: FormViewModelComponent) {
    return (submission, callback) => instance.beforeSubmit(submission, callback)
  }

  public beforeSubmit(submission: any, callback: FormioSubmissionCallback) {
    this.errors$.next([])
    combineLatest([this.formDefinitionId$, this.taskInstanceId$]).pipe(take(1)).subscribe(([formId, taskInstanceId]) => {
      this.viewModelService.submitViewModel(formId, taskInstanceId, this.convertSubmissionToViewModel(submission.data))
        .pipe(catchError(error => {
          callback({message: error, component: null}, null)
          return this.handleSubmitError(error)
        }))
        .subscribe(response => {
          if(!response) {
            callback(null, submission)
          } else {
            callback({message: response.error, component: response.component}, submission)
            this.errors$.next([response.error])
          }
      })
    })
  }

  private handleSubmitError(error: any) {
    return throwError(error);
  }

  public onSubmit(submission: FormioSubmission): void {
    this.submit.next(submission)
  }

  public formReady(form: FormIoSourceComponent): void {
  }

  public onChange(object: any): void {
    if(object.data) {
      this.change$.next(object);
    }
  }

  public loadInitialViewModel() {
    combineLatest([this.formDefinitionId$, this.taskInstanceId$]).pipe(take(1)).subscribe(([formId, taskInstanceId]) => {
      this.viewModelService.getViewModel(formId, taskInstanceId).subscribe(viewModel => {
        this.change$.pipe(take(1)).subscribe(change => {
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
        combineLatest([this.formDefinitionId$, this.taskInstanceId$, this.change$]).pipe(take(1)).subscribe(([formId, taskInstanceId, change]) => {
          const viewModel = this.convertSubmissionToViewModel(change.data);
          this.viewModelService.updateViewModel(formId, taskInstanceId, viewModel).subscribe(viewModel => {
            const submission = this.convertViewModelToSubmission(viewModel, change.data);
            this.submission$.next(submission);
            this.change$.pipe(take(1)).subscribe(change => {
              this.updating$.next(false);
            })
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
