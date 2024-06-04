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
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {
  ActionItem,
  CarbonListItem,
  CarbonListModule,
  ColumnConfig,
  ConfirmationModalModule,
  ViewType,
} from '@valtimo/components';
import {ButtonModule, IconModule, TabsModule} from 'carbon-components-angular';
import {BehaviorSubject, Subject, take} from 'rxjs';
import {
  AVAILABLE_WIDGETS,
  WidgetConfig,
  WidgetStyle,
  WidgetTabConfiguration,
} from '../../../models';
import {WidgetTabManagementService, WidgetWizardService} from '../../../services';
import {DossierManagementWidgetWizardComponent} from '../../dossier-management-widget-wizard/dossier-management-widget-wizard.component';

@Component({
  selector: 'valtimo-dossier-management-widgets-editor',
  templateUrl: './dossier-management-widgets-editor.component.html',
  styleUrls: ['./dossier-management-widgets-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    CarbonListModule,
    ButtonModule,
    IconModule,
    TabsModule,
    DossierManagementWidgetWizardComponent,
    ConfirmationModalModule,
  ],
})
export class DossierManagementWidgetsEditorComponent {
  @Input() public documentDefinitionName;
  @Input() public tabWidgetKey;
  private _currentWidgetTab: WidgetTabConfiguration;
  @Input() public set currentWidgetTab(value: WidgetTabConfiguration) {
    this._currentWidgetTab = value;
    this.items$.next(value.widgets);
  }
  public get currentWidgetTab(): WidgetTabConfiguration {
    return this._currentWidgetTab;
  }

  @Output() public readonly changeSaved = new EventEmitter();

  public readonly FIELDS: ColumnConfig[] = [
    {
      key: 'key',
      label: 'Key',
      viewType: ViewType.TEXT,
    },
  ];

  public readonly ACTION_ITEMS: ActionItem[] = [
    {
      label: 'interface.edit',
      callback: this.editWidget.bind(this),
    },
    {
      label: 'interface.delete',
      callback: this.deleteWidget.bind(this),
      type: 'danger',
    },
  ];

  public readonly items$ = new BehaviorSubject<CarbonListItem[]>([]);

  public readonly addModalOpen$ = new BehaviorSubject<boolean>(false);
  public readonly deleteModalOpen$ = new BehaviorSubject<boolean>(false);
  public readonly deleteRowKey$ = new Subject<number>();

  constructor(
    private readonly widgetTabManagementService: WidgetTabManagementService,
    private readonly widgetWizardService: WidgetWizardService
  ) {}

  public openAddModal(): void {
    this.addModalOpen$.next(true);
  }

  private editWidget(tabWidget: any): void {
    this.widgetWizardService.widgetTitle.set(tabWidget.title);
    this.widgetWizardService.widgetStyle.set(
      tabWidget.highContrast ? WidgetStyle.HIGH_CONTRAST : WidgetStyle.DEFAULT
    );
    this.widgetWizardService.widgetWidth.set(tabWidget.width);
    this.widgetWizardService.selectedWidget.set(
      AVAILABLE_WIDGETS.find(available => available.type === tabWidget.type) ?? null
    );
    this.widgetWizardService.widgetContent.set(
      tabWidget.properties.columns.reduce(
        (acc, curr, index) => ({
          ...acc,
          [index]: curr,
        }),
        {}
      )
    );
    this.addModalOpen$.next(true);
  }

  public onDeleteConfirm(widgetKey: string): void {
    this.widgetTabManagementService
      .updateWidgets({
        ...this.currentWidgetTab,
        widgets: this.currentWidgetTab.widgets.filter(widget => widget.key !== widgetKey),
      })
      .pipe(take(1))
      .subscribe(() => {
        this.changeSaved.emit();
      });
  }

  private deleteWidget(tabWidget: any): void {
    this.deleteRowKey$.next(tabWidget.key);
    this.deleteModalOpen$.next(true);
  }

  public onCloseEvent(event: any, widgets: any[]): void {
    this.addModalOpen$.next(false);

    if (!event) return;

    const isEdit = widgets.findIndex(widget => widget.key === event.key) !== -1;
    this.widgetTabManagementService
      .updateWidgets({
        caseDefinitionName: this.documentDefinitionName,
        key: this.tabWidgetKey,
        widgets: isEdit
          ? widgets.map(widget => (widget.key === event.key ? event : widget))
          : [...widgets, event],
      })
      .pipe(take(1))
      .subscribe(() => {
        this.changeSaved.emit();
      });
  }

  public onItemsReordered(widgets: WidgetConfig[]): void {
    this.widgetTabManagementService
      .updateWidgets({
        ...this.currentWidgetTab,
        widgets,
      })
      .pipe(take(1))
      .subscribe(() => {
        this.changeSaved.emit();
      });
  }
}
