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
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {CarbonTableConfig, ColumnConfig, ViewType} from '@valtimo/components';
import {ApiTabItem} from '@valtimo/dossier';
import {BehaviorSubject, map, Observable, tap} from 'rxjs';
import {TabManagementService, TabService} from '../../services';

@Component({
  selector: 'valtimo-dossier-management-tabs',
  templateUrl: './dossier-management-tabs.component.html',
  styleUrls: ['./dossier-management-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DossierManagementTabsComponent implements AfterViewInit {
  @ViewChild('tabTypeColumn') tabTypeColumnTemplate: TemplateRef<any>;

  private _documentDefinitionName: string;
  @Input() public set documentDefinitionName(value: string) {
    if (!value) {
      return;
    }
    this._documentDefinitionName = value;
    this.tabManagementService.setCaseDefinitionId(value);
    this.tabManagementService.loadTabs();
  }
  public get documentDefinitionName(): string {
    return this._documentDefinitionName;
  }

  public readonly deleteRowKey$ = new BehaviorSubject<string | null>(null);
  public readonly showDeleteModal$: Observable<boolean> = this.deleteRowKey$.pipe(
    map((key: string | null) => !!key)
  );
  public readonly openEditModal$ = new BehaviorSubject<boolean>(false);
  public readonly fields$ = new BehaviorSubject<ColumnConfig[]>([]);
  public readonly loading$: Observable<boolean> = this.tabManagementService.loading$;
  public readonly openAddModal$ = new BehaviorSubject<boolean>(false);
  public readonly tabs$: Observable<ApiTabItem[]> = this.tabManagementService.tabs$.pipe(
    tap((tabs: ApiTabItem[]) => {
      this.tabService.configuredTabKeys = tabs.map((tab: ApiTabItem) => tab.contentKey);
    })
  );
  public readonly tab$ = new BehaviorSubject<ApiTabItem | null>(null);
  public readonly tableConfig: CarbonTableConfig = {sortable: false};

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly tabService: TabService,
    private readonly tabManagementService: TabManagementService,
    private readonly translateService: TranslateService
  ) {}

  public ngAfterViewInit(): void {
    this.fields$.next([
      {
        key: 'name',
        label: 'dossierManagement.tabManagement.columns.name',
        viewType: ViewType.TEXT,
      },
      {
        key: 'key',
        label: 'dossierManagement.tabManagement.columns.key',
        viewType: ViewType.TEXT,
      },
      {
        viewType: ViewType.TEMPLATE,
        template: this.tabTypeColumnTemplate,
        key: '',
        label: 'dossierManagement.tabManagement.columns.type',
      },
      {
        key: 'contentKey',
        label: 'dossierManagement.tabManagement.columns.content',
        viewType: ViewType.TEXT,
      },
      {
        actions: [
          {
            actionName: 'interface.edit',
            callback: this.openEditTabModal.bind(this),
          },
          {
            actionName: 'interface.delete',
            callback: this.openDeleteConfirmationModal.bind(this),
            type: 'danger',
          },
        ],
        className: 'valtimo-dossier-management-tabs__actions',
        key: '',
        label: '',
        viewType: ViewType.ACTION,
      },
    ]);

    this.cd.detectChanges();
  }

  public isTranslated(key: string): boolean {
    return this.translateService.instant(key) !== key;
  }

  public openAddTabModal(): void {
    this.openAddModal$.next(true);
  }

  public openEditTabModal(tab: ApiTabItem): void {
    this.tab$.next(tab);
    this.openEditModal$.next(true);
  }

  public onCloseAddModalEvent(tab: ApiTabItem | null): void {
    this.openAddModal$.next(false);

    if (!tab) {
      return;
    }

    this.addTab(tab);
  }

  public onCloseEditModalEvent(tab: ApiTabItem | null): void {
    this.openEditModal$.next(false);
    this.tab$.next(null);

    if (!tab) {
      return;
    }

    this.editTab(tab);
  }

  public openDeleteConfirmationModal(tab: ApiTabItem): void {
    this.deleteRowKey$.next(tab.key);
  }

  public onConfirmEvent(tabKey: string): void {
    this.deleteTab(tabKey);
  }

  private addTab(tab: Partial<ApiTabItem>): void {
    this.tabManagementService.dispatchAction(this.tabManagementService.addTab(tab));
  }

  private deleteTab(tabKey: string): void {
    this.tabManagementService.dispatchAction(this.tabManagementService.deleteTab(tabKey));
  }

  private editTab(tab: ApiTabItem): void {
    this.tabManagementService.dispatchAction(this.tabManagementService.editTab(tab, tab.key));
  }
}
