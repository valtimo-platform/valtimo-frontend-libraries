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

import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {FormFlowService} from '../../services/form-flow.service';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  finalize,
  map, merge,
  Observable, of,
  Subscription,
  switchMap,
  take,
  tap
} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {EditorModel, PageTitleService} from '@valtimo/components';
import {FormFlowDefinition, FormFlowDefinitionId} from '../../models';
import {NotificationService} from 'carbon-components-angular';
import {TranslateService} from '@ngx-translate/core';
import {FormFlowDownloadService} from '../../services/form-flow-download.service';

@Component({
  templateUrl: './form-flow-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./form-flow-editor.component.scss'],
  providers: [NotificationService],
})
export class FormFlowEditorComponent implements OnInit, OnDestroy {
  public readonly model$ = new BehaviorSubject<EditorModel | null>(null);
  public readonly saveDisabled$ = new BehaviorSubject<boolean>(true);
  public readonly editorDisabled$ = new BehaviorSubject<boolean>(false);
  public readonly moreDisabled$ = new BehaviorSubject<boolean>(true);
  public readonly showDeleteModal$ = new BehaviorSubject<boolean>(false);
  public readonly showEditModal$ = new BehaviorSubject<boolean>(false);
  public readonly formFlowDefinitionId$ = new BehaviorSubject<FormFlowDefinitionId | null>(null);
  private _idSubscription!: Subscription;

  private readonly _updatedModelValue$ = new BehaviorSubject<string>('');

  constructor(
    private readonly formFlowService: FormFlowService,
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly translateService: TranslateService,
    private readonly formFlowDownloadService: FormFlowDownloadService
  ) {}

  public ngOnInit(): void {
    this.getFormFlowDefinitions();
    this.openFormFlowDefinitionIdSubscription();
  }

  public ngOnDestroy(): void {
    this.pageTitleService.enableReset();
    this._idSubscription?.unsubscribe();
  }

  public onValid(valid: boolean): void {
    this.saveDisabled$.next(valid === false);
  }

  public onValueChange(value: string): void {
    this._updatedModelValue$.next(value);
  }

  public updateFormFlowDefinition(): void {
    this.disableEditor();
    this.disableSave();
    this.disableMore();

    combineLatest([this._updatedModelValue$, this.formFlowDefinitionId$])
      .pipe(
        take(1),
        map(([updatedModelValue, formFlowDefinitionId]) => {
          return {
            ...JSON.parse(updatedModelValue) as FormFlowDefinition,
            key: formFlowDefinitionId.key,
            version: (++formFlowDefinitionId.version)
          };
        }),
        switchMap(updatedFormFlowDefinition =>
          this.formFlowService.updateFormFlowDefinition(
            updatedFormFlowDefinition.key,
            updatedFormFlowDefinition
          )
        )
      )
      .subscribe({
        next: result => {
          this.router.navigate([`/form-flow-management/${result.key}/${result.version}`]);
          this.showSuccessMessage({key: result.key, version: result.version});
        },
        error: () => {
          this.enableMore();
          this.enableSave();
          this.enableEditor();
        },
      });
  }

  public onDelete(formFlowDefinitionKey: string): void {
    this.disableEditor();
    this.disableSave();
    this.disableMore();

    this.formFlowService.dispatchAction(
      this.formFlowService.deleteFormFlowDefinition(formFlowDefinitionKey).pipe(
        finalize(() => {
          this.router.navigate(['/form-flow-management']);
        })
      )
    );
  }

  public showDeleteModal(): void {
    this.showDeleteModal$.next(true);
  }

  public showEditModal(): void {
    this.showEditModal$.next(true);
  }

  public onEdit(currentFormFlowKey: string, data: FormFlowDefinition | null): void {
    this.showEditModal$.next(false);

    if (!data) {
      return;
    }

    this.disableEditor();
    this.disableSave();
    this.disableMore();

    this.formFlowService.updateFormFlowDefinition(currentFormFlowKey, data).subscribe(() => {
      this.router.navigate([`/form-flow-management/${data.key}/${data.version}`]);
      this.showSuccessMessage({key: data.key, version: data.version});
    });
  }

  public downloadFormFlowDefinition(model: EditorModel): void {
    this.formFlowDefinitionId$.subscribe(formFlowDefinitionId =>
      this.formFlowDownloadService.downloadJson(
        JSON.parse(model.value),
        formFlowDefinitionId
      )
    );
  }

  private getFormFlowDefinitions(): void {
    this.route.params
      .pipe(
        filter(params => params?.key),
        map(params => {
          return {key: params.key, version: params.version || 1};
        }),
        tap(formFlowDefinitionId => {
          this.pageTitleService.setCustomPageTitle(formFlowDefinitionId.key);
          this.formFlowDefinitionId$.next(formFlowDefinitionId);
        }),
        switchMap(id => this.formFlowService.getFormFlowDefinition(id))
      )
      .subscribe(formFlowDefinition => {
        this.enableMore();
        if (formFlowDefinition.readOnly) {
          this.disableSave();
          this.disableEditor();
        } else {
          this.enableSave();
          this.enableEditor();
        }
        this.setModel(formFlowDefinition);
      });
  }

  private openFormFlowDefinitionIdSubscription(): void {
    this._idSubscription = this.route.params
      .pipe(
        filter(params => params?.key),
        map(params => {
          return {key: params.key, version: params.version || 1};
        }),
        tap(formFlowDefinitionId => {
          this.pageTitleService.setCustomPageTitle(formFlowDefinitionId.key);
          this.formFlowDefinitionId$.next(formFlowDefinitionId);
        }),
        switchMap(id => this.formFlowService.getFormFlowDefinition(id))
      )
      .subscribe(formFlowDefinition => {
        this.enableMore();
        if (formFlowDefinition.readOnly) {
          this.disableSave();
          this.disableEditor();
        } else {
          this.enableSave();
          this.enableEditor();
        }
        this.setModel(formFlowDefinition);
      });
  }

  private setModel(formFlowDefinition: FormFlowDefinition): void {
    let copy = formFlowDefinition;
    delete copy.version;
    delete copy.readOnly;
    this.model$.next({
      value: JSON.stringify(copy),
      language: 'json',
    });
  }

  private disableMore(): void {
    this.moreDisabled$.next(true);
  }

  private enableMore(): void {
    this.moreDisabled$.next(false);
  }

  private disableSave(): void {
    this.saveDisabled$.next(true);
  }

  private enableSave(): void {
    this.saveDisabled$.next(false);
  }

  private disableEditor(): void {
    this.editorDisabled$.next(true);
  }

  private enableEditor(): void {
    this.editorDisabled$.next(false);
  }

  private showSuccessMessage(id: FormFlowDefinitionId): void {
    this.notificationService.showToast({
      caption: this.translateService.instant('formFlow.savedSuccessTitleMessage', {
        key: id.key,
        version: id.version
      }),
      type: 'success',
      duration: 4000,
      showClose: true,
      title: this.translateService.instant('formFlow.savedSuccessTitle'),
    });
  }
}
