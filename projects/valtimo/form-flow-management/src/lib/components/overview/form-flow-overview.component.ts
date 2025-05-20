/*
 * Copyright 2015-2025 Ritense BV, the Netherlands.
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
import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ActionItem, CarbonListComponent, ColumnConfig, ViewType} from '@valtimo/components';
import {BehaviorSubject, finalize, Observable, of, switchMap, tap, map, combineLatest} from 'rxjs';
import {FormFlowDefinition, ListFormFlowDefinition} from '../../models';
import {FormFlowService, FormFlowService2} from '../../services';
import {
  CaseManagementParams,
  GlobalNotificationService,
  Page,
  getCaseManagementRouteParams,
} from '@valtimo/config';
import {TranslateService} from '@ngx-translate/core';

@Component({
  standalone: false,
  templateUrl: './form-flow-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFlowOverviewComponent implements OnInit {
  @ViewChild(CarbonListComponent) carbonList: CarbonListComponent;

  public readonly FIELDS: ColumnConfig[] = [
    {
      viewType: ViewType.TEXT,
      key: 'key',
      label: 'formFlow.key',
    },
    {
      viewType: ViewType.TEXT,
      key: 'versions.0',
      label: 'formFlow.version',
    },
    {
      viewType: ViewType.BOOLEAN,
      key: 'readOnly',
      label: 'formFlow.readOnly',
    },
  ];

  public readonly ACTION_ITEMS: ActionItem[] = [
    {
      callback: this.editFormFlowDetails.bind(this),
      label: 'interface.edit',
    },
    {
      callback: this.deleteFormFlow.bind(this),
      label: 'interface.delete',
      type: 'danger',
    },
  ];

  public readonly showDeleteModal$ = new BehaviorSubject<boolean>(false);
  public readonly deleteDefinitionKey$ = new BehaviorSubject<string | null>(null);

  private _params: CaseManagementParams | undefined = undefined;
  private readonly _refresh$ = new BehaviorSubject<null>(null);
  public readonly formFlowDefinitions$: Observable<ListFormFlowDefinition[]> = combineLatest([
    getCaseManagementRouteParams(this.route),
    this._refresh$,
  ]).pipe(
    tap(([params]) => (this._params = params)),
    switchMap(([params]) =>
      !params
        ? of(null)
        : this.formFlowService2.getFormFlowDefinitions(
            params.caseDefinitionKey,
            params.caseDefinitionVersionTag
          )
    ),
    map((formFlows: Page<ListFormFlowDefinition> | null) => (!formFlows ? [] : formFlows.content))
  );
  public readonly loading$: Observable<boolean> = this.formFlowService.loading$;
  public readonly showAddModal$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly formFlowService: FormFlowService,
    private readonly formFlowService2: FormFlowService2,
    private readonly globalNotificationService: GlobalNotificationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    this.formFlowService.loadFormFlows();
  }

  public openAddModal(): void {
    this.showAddModal$.next(true);
  }

  public onAdd(data: FormFlowDefinition | null): void {
    this.showAddModal$.next(false);

    if (!data || !this._params) {
      return;
    }

    this.formFlowService2
      .createFormFlowDefinition(
        this._params.caseDefinitionKey,
        this._params.caseDefinitionVersionTag,
        data
      )
      .subscribe({
        next: () => {
          this.showAddModal$.next(false);
          this._refresh$.next(null);
        },
      });
  }

  public onRowClick(formFlow: ListFormFlowDefinition): void {
    this.router.navigate([`/form-flow-management/${formFlow.key}`]);
  }

  public editFormFlowDetails(item: any): void {
    console.log({item});
  }

  public deleteFormFlow(item: ListFormFlowDefinition): void {
    this.deleteDefinitionKey$.next(item.key);
    this.showDeleteModal$.next(true);
  }

  public onDelete(definitionKey: string): void {
    if (!this._params) return;

    this.formFlowService2
      .deleteFormFlowDefinition(
        this._params.caseDefinitionKey,
        this._params.caseDefinitionVersionTag,
        definitionKey
      )
      .subscribe(() => {
        this.globalNotificationService.showToast({
          title: 'Delete',
          caption: this.translateService.instant('formFlow.deletedSuccessfully', {
            key: definitionKey,
          }),
          type: 'success',
        });
        this._refresh$.next(null);
      });
  }
}
