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
import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {
  ActionItem,
  CarbonListItem,
  CarbonListModule,
  ColumnConfig,
  ConfirmationModalModule,
  KeyGeneratorService,
  ViewType,
} from '@valtimo/components';
import {ButtonModule, IconModule, TabsModule} from 'carbon-components-angular';
import {cloneDeep} from 'lodash';
import {BehaviorSubject, combineLatest, filter, map, Observable, Subject} from 'rxjs';
import {AVAILABLE_WIDGETS, BasicWidget, Widget, WidgetStyle, WidgetTypeTags} from '../../models';
import {WidgetWizardService} from '../../services';

@Component({
  selector: 'valtimo-widget-management-editor',
  templateUrl: './widget-management-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    CarbonListModule,
    ButtonModule,
    IconModule,
    TabsModule,
    // CasManagementWidgetWizardComponent,
    ConfirmationModalModule,
  ],
})
export class WidgetManagementEditorComponent {
  @Input() public set widgets(value: BasicWidget[]) {
    console.log({value});
    this._items$.next(value);
  }
  // @Input() public params: CaseManagementParams;
  // @Input() public tabWidgetKey: string;
  // private _currentWidgetTab: CaseWidgetsRes;
  // @Input() public set currentWidgetTab(value: CaseWidgetsRes) {
  //   if (!value) return;

  //   this._currentWidgetTab = value;
  //   this._items$.next(value?.widgets);
  //   this._usedKeys = value?.widgets.map(widget => widget.key);
  //   this.$dragAndDropDisabled.set(false);
  // }
  // public get currentWidgetTab(): CaseWidgetsRes {
  //   return this._currentWidgetTab;
  // }

  @Output() public readonly changeSaved = new EventEmitter();

  public readonly FIELDS: ColumnConfig[] = [
    {
      key: 'title',
      label: 'interface.title',
      viewType: ViewType.TEXT,
    },
    {
      key: 'tags',
      label: 'widgetTabManagement.columns.type',
      viewType: ViewType.TAGS,
    },
    {
      key: 'key',
      label: 'interface.key',
      viewType: ViewType.TEXT,
    },
    {
      key: 'widthTranslation',
      label: 'widgetTabManagement.columns.width',
      viewType: ViewType.TEXT,
    },
    {
      key: 'highContrast',
      label: 'widgetTabManagement.columns.highContrast',
      viewType: ViewType.BOOLEAN,
    },
  ];

  public readonly ACTION_ITEMS: ActionItem[] = [
    {
      label: 'interface.edit',
      callback: this.editWidget.bind(this),
    },
    {
      label: 'interface.duplicate',
      callback: this.duplicateWidget.bind(this),
    },
    {
      label: 'interface.delete',
      callback: this.deleteWidget.bind(this),
      type: 'danger',
    },
  ];

  private readonly _items$ = new BehaviorSubject<CarbonListItem[]>([]);
  public readonly items$: Observable<CarbonListItem[]> = combineLatest([
    this._items$,
    this.translateService.stream('key'),
  ]).pipe(
    filter(([items]) => !!items),
    // tap(([items]) => console.log({items})),
    map(([items]) =>
      items.map(item => ({
        ...item,
        widthTranslation: this.translateService.instant(this.getWidthTranslationKey(item.width)),
        tags: [
          {
            content: this.translateService.instant(`widgetTabManagement.types.${item.type}.title`),
            type: WidgetTypeTags[item.type],
          },
        ],
      }))
    )
  );

  public readonly $isWizardOpen = signal<boolean>(false);
  public readonly $isEditMode = this.widgetWizardService.$editMode;
  public readonly deleteModalOpen$ = new BehaviorSubject<boolean>(false);
  public readonly deleteRowKey$ = new Subject<number>();

  public readonly $dragAndDropDisabled = signal(false);

  private _usedKeys: string[];

  constructor(
    private readonly keyGeneratorService: KeyGeneratorService,
    private readonly translateService: TranslateService,
    private readonly widgetWizardService: WidgetWizardService
    // private readonly widgetTabManagementService: WidgetTabManagementService,
  ) {}

  public editWidget(tabWidget: Widget): void {
    this.widgetWizardService.$widgetTitle.set(tabWidget.title);
    this.widgetWizardService.$widgetStyle.set(
      tabWidget.highContrast ? WidgetStyle.HIGH_CONTRAST : WidgetStyle.DEFAULT
    );
    this.widgetWizardService.$widgetWidth.set(tabWidget.width);
    this.widgetWizardService.$selectedWidget.set(
      AVAILABLE_WIDGETS.find(available => available.type === tabWidget.type) ?? null
    );
    this.widgetWizardService.$widgetContent.set(tabWidget.properties);
    this.widgetWizardService.$editMode.set(true);
    this.widgetWizardService.$widgetKey.set(tabWidget.key);
    this.widgetWizardService.$widgetActions.set(tabWidget.actions);
    this.$isWizardOpen.set(true);
    console.log('edit', this.widgetWizardService.$widgetsConfig());
  }

  public duplicateWidget(tabWidget: Widget): void {
    const tabWidgetClone = cloneDeep(tabWidget);
    tabWidgetClone.key = '';
    this.editWidget(tabWidgetClone);
  }

  public openAddModal(): void {
    this.$isWizardOpen.set(true);
  }

  public onDeleteConfirm(widgetKey: string): void {
    // this.widgetTabManagementService
    //   .updateWidgets({
    //     ...this.currentWidgetTab,
    //     widgets: this.currentWidgetTab.widgets.filter(widget => widget.key !== widgetKey),
    //   })
    //   .pipe(take(1))
    //   .subscribe(() => {
    //     this.changeSaved.emit();
    //   });
  }

  public onCloseEvent(widgetResult: BasicWidget, existingWidgets: Widget[]): void {
    this.$isWizardOpen.set(false);
    this.widgetWizardService.resetWizard();

    if (!widgetResult) return;

    // this.widgetTabManagementService
    //   .updateWidgets({
    //     caseDefinitionKey: this.params.caseDefinitionKey,
    //     caseDefinitionVersionTag: this.params.caseDefinitionVersionTag,
    //     key: this.tabWidgetKey,
    //     widgets: !!widgetResult.key
    //       ? existingWidgets.map((widget: BasicCaseWidget) =>
    //           widget.key === widgetResult.key ? widgetResult : widget
    //         )
    //       : [
    //           ...existingWidgets,
    //           {
    //             ...widgetResult,
    //             key: this.keyGeneratorService.getUniqueKey(widgetResult.title, this._usedKeys),
    //           },
    //         ],
    //   })
    //   .pipe(take(1))
    //   .subscribe(() => {
    //     this.changeSaved.emit();
    //   });
  }

  public onItemsReordered(widgets: Widget[]): void {
    this.$dragAndDropDisabled.set(true);
    console.log('reordered');

    // this.widgetTabManagementService
    //   .updateWidgets({
    //     ...this.currentWidgetTab,
    //     widgets,
    //   })
    //   .pipe(take(1))
    //   .subscribe(() => {
    //     this.changeSaved.emit();
    //   });
  }

  private deleteWidget(tabWidget: any): void {
    this.deleteRowKey$.next(tabWidget.key);
    this.deleteModalOpen$.next(true);
  }

  private getWidthTranslationKey(width: number): string {
    switch (width) {
      case 1:
        return 'widgetTabManagement.width.small.title';
      case 2:
        return 'widgetTabManagement.width.medium.title';
      case 3:
        return 'widgetTabManagement.width.large.title';
      case 4:
        return 'widgetTabManagement.width.xtraLarge.title';
      default:
        return '-';
    }
  }
}
