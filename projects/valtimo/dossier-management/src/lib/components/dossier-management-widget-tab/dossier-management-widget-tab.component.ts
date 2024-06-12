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
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Edit16} from '@carbon/icons';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {
  BreadcrumbService,
  PageHeaderService,
  PageTitleService,
  PendingChangesComponent,
  RenderInPageHeaderDirectiveModule,
} from '@valtimo/components';
import {ApiTabItem} from '@valtimo/dossier';
import {ButtonModule, IconModule, IconService, TabsModule} from 'carbon-components-angular';
import moment from 'moment/moment';
import {BehaviorSubject, combineLatest, filter, map, Observable, switchMap, tap} from 'rxjs';
import {TabManagementService, WidgetTabManagementService} from '../../services';
import {CommonModule} from '@angular/common';
import {DossierManagementWidgetsEditorComponent} from './editor/dossier-management-widgets-editor.component';
import {DossierManagementWidgetTabEditModalComponent} from '../dossier-management-widget-tab-edit-modal/dossier-management-widget-tab-edit-modal';
import {DossierManagementWidgetsJsonEditorComponent} from './json-editor/dossier-management-widgets-json-editor.component';
import {WidgetEditorTab} from '../../models';

@Component({
  selector: 'valtimo-dossier-management-case-widgets',
  templateUrl: './dossier-management-widget-tab.component.html',
  styleUrl: './dossier-management-widget-tab.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslateModule,
    DossierManagementWidgetsEditorComponent,
    DossierManagementWidgetTabEditModalComponent,
    DossierManagementWidgetsJsonEditorComponent,
    RenderInPageHeaderDirectiveModule,
    ButtonModule,
    IconModule,
    TabsModule,
  ],
})
export class DossierManagementWidgetTabComponent
  extends PendingChangesComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(DossierManagementWidgetsJsonEditorComponent)
  private _jsonEditor: DossierManagementWidgetsJsonEditorComponent;

  public readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.name || ''),
    filter(documentDefinitionName => !!documentDefinitionName),
    tap(documentDefinitionName =>
      this.tabManagementService.setCaseDefinitionId(documentDefinitionName)
    )
  );

  public readonly tabWidgetKey$: Observable<string> = this.route.params.pipe(
    map(params => params.key || ''),
    filter(tabWidgetKey => !!tabWidgetKey)
  );

  private readonly _refreshWidgetTabSubject$ = new BehaviorSubject<null>(null);
  public readonly showEditWidgetTabModal$ = new BehaviorSubject<boolean>(false);
  public readonly currentWidgetTabItem$: Observable<ApiTabItem> = combineLatest([
    this.tabWidgetKey$,
    this.translateService.stream('key'),
    this._refreshWidgetTabSubject$,
  ]).pipe(
    switchMap(([tabKey]) => this.tabManagementService.getTab(tabKey)),
    tap(tabItem => {
      const title =
        tabItem.name ||
        this.translateService.instant(`widgetTabManagement.metadata.${tabItem.key}`);
      this.pageTitleService.setCustomPageTitle(title);
      this.pageTitleService.setCustomPageSubtitle(
        this.translateService.instant('widgetTabManagement.tab.metadata', {
          createdBy: tabItem?.createdBy || '-',
          createdOn: !!tabItem?.createdOn
            ? moment(tabItem?.createdOn).format('DD MMM YYYY HH:mm')
            : '-',
          key: tabItem.key,
        })
      );
    })
  );
  public readonly currentWidgetTab$ = combineLatest([
    this.documentDefinitionName$,
    this.tabWidgetKey$,
    this._refreshWidgetTabSubject$,
  ]).pipe(
    switchMap(([caseDefinitionName, tabWidgetKey]) =>
      this.widgetTabManagementService.getWidgetTabConfiguration(caseDefinitionName, tabWidgetKey)
    )
  );

  public readonly WidgetEditorTab = WidgetEditorTab;
  public readonly activeTab = signal<WidgetEditorTab | null>(WidgetEditorTab.JSON);
  public readonly compactMode$ = this.pageHeaderService.compactMode$;

  private _pendingTab: WidgetEditorTab | null = null;

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly cdr: ChangeDetectorRef,
    private readonly iconService: IconService,
    private readonly pageTitleService: PageTitleService,
    private readonly route: ActivatedRoute,
    private readonly tabManagementService: TabManagementService,
    private readonly widgetTabManagementService: WidgetTabManagementService,
    private readonly translateService: TranslateService,
    private readonly pageHeaderService: PageHeaderService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.pageTitleService.disableReset();
  }

  public ngAfterViewInit(): void {
    this.iconService.registerAll([Edit16]);
    this.initBreadcrumb();
    this.customModal = this._jsonEditor.pendingChangesModal;
  }

  public ngOnDestroy(): void {
    this.breadcrumbService.clearThirdBreadcrumb();
    this.pageTitleService.disableReset();
  }

  public displayBodyComponent(tab: WidgetEditorTab): void {
    if (this.pendingChanges && tab !== this.activeTab()) {
      this._pendingTab = tab;
      this.onCanDeactivate();
      return;
    }
    this.activeTab.set(tab);
  }

  public editWidgetTab(): void {
    this.showEditWidgetTabModal();
  }

  public onPendingChangesUpdate(changeActive: boolean): void {
    this.pendingChanges = changeActive;
  }

  private showEditWidgetTabModal(): void {
    this.showEditWidgetTabModal$.next(true);
  }

  public refreshWidgetTab(): void {
    if (this.pendingChanges) this.onCustomConfirm();
    this._refreshWidgetTabSubject$.next(null);
  }

  public onJsonCanDeactivate(event): void {
    if (event) {
      this.onCustomConfirm();
      return;
    }

    this.onCustomCancel();
  }

  protected onCancelRedirect(): void {
    this.activeTab.update(tab => tab);
    this._pendingTab
    this.cdr.detectChanges();
  }

  protected onConfirmRedirect(): void {
    this.activeTab.set(this._pendingTab);
  }

  protected onCanDeactivate(): void {
    this._jsonEditor.onCanDeactivate();
  }

  private initBreadcrumb(): void {
    this.documentDefinitionName$.subscribe(documentDefinitionName => {
      this.breadcrumbService.setThirdBreadcrumb({
        route: [`/dossier-management/dossier/${documentDefinitionName}`],
        content: documentDefinitionName,
        href: `/dossier-management/dossier/${documentDefinitionName}`,
      });
    });
  }
}
