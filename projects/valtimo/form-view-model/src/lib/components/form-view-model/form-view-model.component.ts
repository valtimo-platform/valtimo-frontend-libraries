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
import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import moment from 'moment';
import {BehaviorSubject, catchError, combineLatest, debounceTime, Observable, Subject, take, throwError} from 'rxjs';
import {FormioComponent, FormioOptions, FormioSubmission, FormioSubmissionCallback} from '@formio/angular';
import {FormioRefreshValue} from '@formio/angular/formio.common';
import {ViewModelService} from '../../services';
import {distinctUntilChanged, map} from 'rxjs/operators';
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
  @ViewChild('formio') formio: FormioComponent;

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
    };
    this.form$.next(form);
  }

  @Input() set formName(formName: string) {
    this.formName$.next(formName);
  }

  @Input() set taskInstanceId(taskInstanceId: string) {
    this.taskInstanceId$.next(taskInstanceId);
  }

  @Input() set readOnly(readOnlyValue: boolean) {
    this.readOnly$.next(readOnlyValue);
  }

  @Input() formRefresh$!: Subject<FormioRefreshValue>;
  @Output() formSubmit = new EventEmitter<any>();

  public refreshForm = new EventEmitter<FormioRefreshValue>();

  public readonly submission$ = new BehaviorSubject<any>({});
  public readonly form$ = new BehaviorSubject<object>(undefined);
  public readonly formName$ = new BehaviorSubject<string>(undefined);
  public readonly options$ = new BehaviorSubject<ValtimoFormioOptions>(undefined);
  public readonly taskInstanceId$ = new BehaviorSubject<string>(undefined);
  public readonly readOnly$ = new BehaviorSubject<boolean>(false);
  public readonly tokenSetInLocalStorage$ = new BehaviorSubject<boolean>(false);
  public readonly change$ = new BehaviorSubject<any>(null);
  public readonly errors$ = new BehaviorSubject<Array<string>>([]);
  public readonly loading$ = new BehaviorSubject<boolean>(true);

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
    })
  );

  constructor(
    private readonly viewModelService: ViewModelService,
    private readonly translateService: TranslateService,
    private readonly stateService: FormIoStateService
  ) {}

  ngOnInit() {
    this.loadInitialViewModel();
  }

  public beforeSubmitHook(instance: FormViewModelComponent) {
    return (submission, callback) => instance.beforeSubmit(submission, callback);
  }

  public beforeSubmit(submission: any, callback: FormioSubmissionCallback) {
    this.errors$.next([]);
    combineLatest([this.formName$, this.taskInstanceId$]).pipe(take(1)).subscribe(([formName, taskInstanceId]) => {
      this.viewModelService.submitViewModel(formName, taskInstanceId, submission.data)
        .pipe(catchError(error => {
          const formInstance = this.formio.formio;
          const component = formInstance.getComponent(error.error?.component);
          component?.setCustomValidity(error.error.error);
          callback({message: error.error.error, component: null}, null);
          this.errors$.next([error.error.error]);
          return this.handleSubmitError(error);
        }))
        .subscribe(response => {
          if (!response) {
            callback(null, submission);
          } else {
            callback({message: response.error, component: null}, submission);
            this.errors$.next([response.error]);
          }
        });
    });
  }

  private handleSubmitError(error: any) {
    return throwError(error);
  }

  public onSubmit(submission: FormioSubmission): void {
    this.formSubmit.next(submission);
  }

  public onChange(object: any): void {
    if (object.data) {
      this.change$.next(object);
    }

    if (object.changed) {
      this.submission$.next(this.submission);
      this.updateViewModel();
    }
  }

  public loadInitialViewModel() {
    combineLatest([this.formName$, this.taskInstanceId$]).pipe(take(1)).subscribe(([formName, taskInstanceId]) => {
      this.viewModelService.getViewModel(formName, taskInstanceId).subscribe(viewModel => {
        this.change$.pipe(take(1)).subscribe(change => {
          this.loading$.next(false);
        });
        this.submission$.next({data: viewModel});
      });
    });
  }

  public updateViewModel() {
    this.loading$.pipe(take(1)).subscribe(updating => {
      if (!updating) {
        this.loading$.next(true);
        combineLatest([this.formName$, this.taskInstanceId$, this.change$]).pipe(take(1), debounceTime(500)).subscribe(([formName, taskInstanceId, change]) => {
          this.viewModelService.updateViewModel(formName, taskInstanceId, change.data).subscribe(viewModel => {
            this.submission$.next({data: viewModel});
            this.change$.pipe(take(1)).subscribe(change => {
              this.loading$.next(false);
            });
          });
        });
      }
    });
  }
}
