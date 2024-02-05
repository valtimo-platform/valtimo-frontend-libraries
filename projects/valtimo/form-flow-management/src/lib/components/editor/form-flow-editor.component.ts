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
import {BehaviorSubject, filter, finalize, map, Subscription, switchMap, take, tap} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {EditorModel, PageTitleService} from '@valtimo/components';
import {FormFlow} from '../../models';
import {NotificationService} from 'carbon-components-angular';
import {TranslateService} from '@ngx-translate/core';
import {FormFlowExportService} from '../../services/form-flow-export.service';

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
  public readonly selectedRowKeys$ = new BehaviorSubject<Array<string> | null>(null);

  private _keySubscription!: Subscription;
  private _key!: string;
  private readonly _updatedModelValue$ = new BehaviorSubject<string>('');

  constructor(
    private readonly formFlowService: FormFlowService,
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly translateService: TranslateService,
    private readonly formFlowExportService: FormFlowExportService
  ) {}

  public ngOnInit(): void {
    this.getPermissions();
    this.openFormFlowKeySubscription();
  }

  public ngOnDestroy(): void {
    this.pageTitleService.enableReset();
    this._keySubscription?.unsubscribe();
  }

  public onValid(valid: boolean): void {
    this.saveDisabled$.next(valid === false);
  }

  public onValueChange(value: string): void {
    this._updatedModelValue$.next(value);
  }

  public updatePermissions(): void {
    this.disableEditor();
    this.disableSave();
    this.disableMore();

    this._updatedModelValue$
      .pipe(
        take(1),
        switchMap(updatedModelValue =>
          this.formFlowService.updateFormFlowPermissions(
            this._key,
            JSON.parse(updatedModelValue)
          )
        )
      )
      .subscribe({
        next: result => {
          this.enableMore();
          this.enableSave();
          this.enableEditor();
          this.showSuccessMessage(this._key);
          this.setModel(result);
        },
        error: () => {
          this.enableMore();
          this.enableSave();
          this.enableEditor();
        },
      });
  }

  public onDelete(formFlows: Array<string>): void {
    this.disableEditor();
    this.disableSave();
    this.disableMore();

    this.formFlowService.dispatchAction(
      this.formFlowService.deleteFormFlows({formFlows}).pipe(
        finalize(() => {
          this.router.navigate(['/form-flow']);
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

  public onEdit(currentFormFlowKey: string, data: FormFlow | null): void {
    this.showEditModal$.next(false);

    if (!data) {
      return;
    }

    this.disableEditor();
    this.disableSave();
    this.disableMore();

    this.formFlowService.updateFormFlow(currentFormFlowKey, data).subscribe(() => {
      this.router.navigate([`/form-flow/${data.key}`]);
      this.showSuccessMessage(data.key);
    });
  }

  public exportPermissions(model: EditorModel): void {
    this.formFlowExportService.downloadJson(
      JSON.parse(model.value),
      'separate',
      this._key
    );
  }

  private openFormFlowKeySubscription(): void {
    this._keySubscription = this.route.params
      .pipe(
        filter(params => params?.id),
        map(params => params.id),
        tap(key => {
          this._key = key;
          this.pageTitleService.setCustomPageTitle(key, true);
          this.selectedRowKeys$.next([key]);
        }),
        switchMap(key => this.formFlowService.getFormFlow(key)),
        tap(permissions => {
          this.enableMore();
          this.enableSave();
          this.enableEditor();
          this.setModel(permissions);
        })
      )
      .subscribe();
  }

  private getPermissions(): void {
    this.route.params
      .pipe(
        tap(params => {
          this.pageTitleService.setCustomPageTitle(params?.id);
          this.selectedRowKeys$.next([params?.id]);
        }),
        switchMap(params => this.formFlowService.getFormFlow(params.id))
      )
      .subscribe(permissions => {
        this.enableMore();
        this.enableSave();
        this.enableEditor();
        this.setModel(permissions);
      });
  }

  private setModel(permissions: object): void {
    this.model$.next({
      value: JSON.stringify(permissions),
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

  private showSuccessMessage(key: string): void {
    this.notificationService.showToast({
      caption: this.translateService.instant('formFlow.formFlows.savedSuccessTitleMessage', {
        key,
      }),
      type: 'success',
      duration: 4000,
      showClose: true,
      title: this.translateService.instant('formFlow.formFlows.savedSuccessTitle'),
    });
  }
}
