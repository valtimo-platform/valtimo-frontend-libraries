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
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  Signal,
  signal,
} from '@angular/core';
import {Edit16, Save16} from '@carbon/icons';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CARBON_CONSTANTS, EditorModel, EditorModule} from '@valtimo/components';
import {CaseWidgetsRes} from '@valtimo/dossier';
import {
  ButtonModule,
  IconModule,
  IconService,
  NotificationService,
} from 'carbon-components-angular';
import {take} from 'rxjs';
import {WidgetTabManagementService} from '../../../services';

@Component({
  selector: 'valtimo-dossier-management-widgets-json-editor',
  templateUrl: './dossier-management-widgets-json-editor.component.html',
  styleUrl: './dossier-management-widgets-json-editor.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, EditorModule, ButtonModule, IconModule],
  providers: [NotificationService],
})
export class DossierManagementWidgetsJsonEditorComponent {
  private _currentWidgetTab: CaseWidgetsRes;
  @Input() public set currentWidgetTab(value: CaseWidgetsRes) {
    this._currentWidgetTab = value;
    this.jsonModel.set({
      value: JSON.stringify(value),
      language: 'json',
    });
  }
  public get currentWidgetTab(): CaseWidgetsRes {
    return this._currentWidgetTab;
  }

  @Output() public readonly changeSaved = new EventEmitter();

  public readonly jsonModel = signal<EditorModel | null>(null);
  public readonly editActive = signal<boolean>(false);

  private readonly _widgetConfig = signal<CaseWidgetsRes | null>(null);

  private readonly _jsonValid = signal<boolean>(false);
  private readonly _keyEdited = signal<boolean>(false);
  public readonly saveButtonDisabled: Signal<boolean> = computed(
    () => !this._jsonValid() || this._keyEdited()
  );

  constructor(
    private readonly iconService: IconService,
    private readonly notificationService: NotificationService,
    private readonly translateService: TranslateService,
    private readonly widgetTabManagementService: WidgetTabManagementService
  ) {
    this.iconService.registerAll([Edit16, Save16]);
  }

  public downloadConfig(): void {
    const dataString =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(this._currentWidgetTab, null, 2));
    const downloadAnchorElement = document.getElementById('downloadAnchorElement');
    if (!downloadAnchorElement) {
      return;
    }

    downloadAnchorElement.setAttribute('href', dataString);
    downloadAnchorElement.setAttribute(
      'download',
      `${this._currentWidgetTab.caseDefinitionName}-widgets.json`
    );
    downloadAnchorElement.click();
  }

  public onCancelClick(): void {
    this.editActive.set(false);
    this.jsonModel.update((model: EditorModel | null) => ({
      ...model,
      value: JSON.stringify(this._currentWidgetTab),
    }));
  }

  public onEditClick(): void {
    this.editActive.set(true);
  }

  public onSaveClick(): void {
    this.editActive.set(false);
    const config: CaseWidgetsRes | null = this._widgetConfig();

    if (!config) return;

    this.widgetTabManagementService
      .updateWidgets(config)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationService.showNotification({
            type: 'success',
            title: this.translateService.instant('interface.success'),
            message: this.translateService.instant('widgetTabManagement.notification.success'),
            showClose: true,
            duration: CARBON_CONSTANTS.notificationDuration,
          });
          this.changeSaved.emit();
        },
        error: () => {
          this.notificationService.showNotification({
            type: 'error',
            title: this.translateService.instant('interface.error'),
            message: this.translateService.instant('widgetTabManagement.notification.error'),
            showClose: true,
            duration: CARBON_CONSTANTS.notificationDuration,
          });
        },
      });
  }

  public onValidEvent(valid: boolean) {
    this._jsonValid.set(valid);
  }

  public onValueChangeEvent(value: string) {
    const widgetConfig: CaseWidgetsRes = JSON.parse(value);

    this._keyEdited.set(widgetConfig.key !== this._currentWidgetTab.key);

    if (!this._jsonValid()) return;

    this._widgetConfig.set(JSON.parse(value));
  }
}
