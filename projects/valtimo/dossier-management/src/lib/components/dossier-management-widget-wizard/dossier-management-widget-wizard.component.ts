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
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {WIDGET_STEPS} from './steps';
import {ButtonModule, ModalModule, ProgressIndicatorModule, Step} from 'carbon-components-angular';
import {WidgetType, WidgetWizardSteps} from '../../models';
import {BehaviorSubject, Observable, combineLatest, map} from 'rxjs';
import {ModalCloseEventType} from '@valtimo/components';

@Component({
  selector: 'valtimo-dossier-management-widget-wizard',
  templateUrl: './dossier-management-widget-wizard.component.html',
  styleUrls: ['./dossier-management-widget-wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ...WIDGET_STEPS,
    ProgressIndicatorModule,
    ModalModule,
    ButtonModule,
  ],
})
export class DossierManagementWidgetWizardComponent {
  @Input() public open = false;

  @Output() public closeEvent = new EventEmitter<ModalCloseEventType>();

  public readonly WidgetWizardSteps = WidgetWizardSteps;
  private readonly _secondaryLabels$ = new BehaviorSubject<{[step: number]: string}>({
    [WidgetWizardSteps.TYPE]: '',
    [WidgetWizardSteps.WIDTH]: '',
    [WidgetWizardSteps.STYLE]: '',
    [WidgetWizardSteps.CONTENT]: '',
  });

  public readonly steps$: Observable<Step[]> = combineLatest([
    this._secondaryLabels$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([secondaryLabels]) => [
      {
        label: this.translateService.instant('widgetTabManagement.wizard.steps.type'),
        secondaryLabel: secondaryLabels[WidgetWizardSteps.TYPE],
      },
      {
        label: this.translateService.instant('widgetTabManagement.wizard.steps.width'),
        secondaryLabel: secondaryLabels[WidgetWizardSteps.WIDTH],
      },
      {
        label: this.translateService.instant('widgetTabManagement.wizard.steps.style'),
        secondaryLabel: secondaryLabels[WidgetWizardSteps.STYLE],
      },
      {
        label: this.translateService.instant('widgetTabManagement.wizard.steps.content'),
        secondaryLabel: secondaryLabels[WidgetWizardSteps.CONTENT],
      },
    ])
  );

  public currentStep = WidgetWizardSteps.TYPE;
  public nextButtonDisabled = true;

  constructor(private readonly translateService: TranslateService) {}

  public onStepSelected(event: {step: Step; index: number}): void {
    this.currentStep = event.index;
  }

  public onNextButtonClick(save: boolean): void {
    if (save) {
      this.closeEvent.emit('closeAndRefresh');
      return;
    }

    this.currentStep += 1;
  }

  public onBackButtonClick(): void {
    this.currentStep -= 1;
  }

  public onClose(): void {
    this.closeEvent.emit('close');
  }

  public onTypeSelected(type: WidgetType): void {
    this.nextButtonDisabled = false;
    console.log(type);
  }
}
