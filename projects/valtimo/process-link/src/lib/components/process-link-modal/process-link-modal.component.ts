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

import {Component} from '@angular/core';
import {
  ProcessLinkButtonService,
  ProcessLinkService,
  ProcessLinkStateService,
  ProcessLinkStepService,
} from '../../services';
import {take} from 'rxjs/operators';
import {ConfigService} from '@valtimo/config';
import {FormDisplayType, FormSize} from '../../models';
import {ListItem} from 'carbon-components-angular/dropdown/list-item.interface';

@Component({
  selector: 'valtimo-process-link-modal',
  templateUrl: './process-link-modal.component.html',
  styleUrls: ['./process-link-modal.component.scss'],
})
export class ProcessLinkModalComponent {
  public readonly showModal$ = this.stateService.showModal$;
  public readonly processStepName$ = this.stateService.elementName$;
  public readonly steps$ = this.stepService.steps$;
  public readonly currentStepIndex$ = this.stepService.currentStepIndex$;
  public readonly currentStepId$ = this.stepService.currentStepId$;
  public readonly showSaveButton$ = this.buttonService.showSaveButton$;
  public readonly enableSaveButton$ = this.buttonService.enableSaveButton$;
  public readonly showBackButton$ = this.buttonService.showBackButton$;
  public readonly showNextButton$ = this.buttonService.showNextButton$;
  public readonly enableNextButton$ = this.buttonService.enableNextButton$;
  public readonly hideProgressIndicator$ = this.stateService.hideProgressIndicator$;
  public readonly saving$ = this.stateService.saving$;
  public readonly typeOfSelectedProcessLink$ = this.stateService.typeOfSelectedProcessLink$;
  public readonly viewModelEnabled$ = this.stateService.viewModelEnabled$;

  public readonly formDisplayValues: Array<ListItem> = Object.keys(FormDisplayType).map(key => ({
    content: FormDisplayType[key],
    id: key,
    selected: false,
  }));

  public readonly formSizeValues: Array<ListItem> = Object.keys(FormSize).map(key => ({
    content: FormSize[key],
    id: key,
    selected: false,
  }));

  public readonly showViewModelToggle =
    this.configService.config.featureToggles.enableFormViewModel;

  constructor(
    private readonly stateService: ProcessLinkStateService,
    private readonly stepService: ProcessLinkStepService,
    private readonly buttonService: ProcessLinkButtonService,
    private readonly processLinkService: ProcessLinkService,
    private readonly processLinkStateService: ProcessLinkStateService,
    private readonly configService: ConfigService
  ) {
    console.log('formDisplayValues ', this.formDisplayValues);
    console.log('formSizeValues ', this.formSizeValues);
  }

  public closeModal(): void {
    this.stateService.closeModal();
  }

  public backButtonClick(): void {
    this.buttonService.clickBackButton();
  }

  public saveButtonClick(): void {
    this.buttonService.clickSaveButton();
  }

  public nextButtonClick(): void {
    this.buttonService.clickNextButton();
  }

  public unlinkButtonClick(): void {
    this.stateService.startSaving();

    this.stateService.selectedProcessLink$.pipe(take(1)).subscribe(selectedProcessLink => {
      this.processLinkService.deleteProcessLink(selectedProcessLink.id).subscribe(
        () => {
          this.stateService.closeModal();
        },
        () => {
          this.stateService.stopSaving();
        }
      );
    });
  }

  public toggleCheckedChange(value: boolean): void {
    this.processLinkStateService.setViewModelEnabled(value);
  }

  public selectFormDisplayType(event): void {
    console.log('selectFormDisplayType event: ', event);
  }

  public selectFormSize(event): void {
    console.log('selectFormSize event: ', event);
  }
}
