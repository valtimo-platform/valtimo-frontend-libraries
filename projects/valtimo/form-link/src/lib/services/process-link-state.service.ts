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

import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {ModalParams, ProcessLinkType} from '../models';
import {ProcessLinkStepService} from './process-link-step.service';
import {ProcessLinkButtonService} from './process-link-button.service';

@Injectable()
export class ProcessLinkStateService implements OnDestroy {
  private readonly _showModal$ = new BehaviorSubject<boolean>(false);
  private readonly _availableProcessLinkTypes$ = new BehaviorSubject<Array<ProcessLinkType>>([]);
  private readonly _elementName$ = new BehaviorSubject<string>('');
  private readonly _selectedProcessLinkTypeId$ = new BehaviorSubject<string>('');
  private readonly _saving$ = new BehaviorSubject<boolean>(false);
  private readonly _modalParams$ = new BehaviorSubject<ModalParams>(undefined);

  private _availableProcessLinkTypesSubscription!: Subscription;

  get showModal$(): Observable<boolean> {
    return this._showModal$.asObservable();
  }
  get elementName$(): Observable<string> {
    return this._elementName$.asObservable();
  }
  get availableProcessLinkTypes$(): Observable<Array<ProcessLinkType>> {
    return this._availableProcessLinkTypes$.asObservable();
  }
  get selectedProcessLinkTypeId$(): Observable<string> {
    return this._selectedProcessLinkTypeId$.asObservable();
  }
  get saving$(): Observable<boolean> {
    return this._saving$.asObservable();
  }
  get modalParams$(): Observable<ModalParams> {
    return this._modalParams$.asObservable();
  }

  constructor(
    private readonly processLinkStepService: ProcessLinkStepService,
    private readonly buttonService: ProcessLinkButtonService
  ) {
    this.openAvailableProcessLinkTypesSubscription();
  }

  ngOnDestroy(): void {
    this._availableProcessLinkTypesSubscription?.unsubscribe();
  }

  setAvailableProcessLinkTypes(processLinkTypes: Array<ProcessLinkType>): void {
    const hasOneOption = processLinkTypes.length === 1;
    this._availableProcessLinkTypes$.next(processLinkTypes);
    this.processLinkStepService.setHasOneProcessLinkType(hasOneOption);

    if (hasOneOption) {
      this.selectProcessLinkType(processLinkTypes[0].processLinkType, hasOneOption);
    }
  }

  setElementName(name: string): void {
    this._elementName$.next(name);
  }

  showModal(): void {
    this._showModal$.next(true);
  }

  closeModal(): void {
    this._showModal$.next(false);

    setTimeout(() => {
      this.reset();
    }, 240);
  }

  selectProcessLinkType(processLinkTypeId: string, hasOneOption?: boolean): void {
    this._selectedProcessLinkTypeId$.next(processLinkTypeId);
    this.setProcessLinkTypeSteps(processLinkTypeId, hasOneOption);
  }

  clearSelectedProcessLinkType(): void {
    this._selectedProcessLinkTypeId$.next('');
  }

  startSaving(): void {
    this._saving$.next(true);
    this.processLinkStepService.disableSteps();
  }

  stopSaving(): void {
    this._saving$.next(false);
    this.processLinkStepService.enableSteps();
  }

  setInitial(): void {
    const availableTypes = this._availableProcessLinkTypes$.getValue();
    this.resetButtons();
    this.processLinkStepService.setInitialSteps(availableTypes);
  }

  setModalParams(params: ModalParams): void {
    this._modalParams$.next(params);
  }

  private openAvailableProcessLinkTypesSubscription(): void {
    this._availableProcessLinkTypesSubscription = this._availableProcessLinkTypes$.subscribe(
      availableProcessLinkTypes => {
        if (availableProcessLinkTypes.length > 1) {
          this.setInitial();
        }
      }
    );
  }
  private reset(): void {
    this.setAvailableProcessLinkTypes([]);
    this.processLinkStepService.reset();
    this.stopSaving();
    this.resetButtons();
    this.clearSelectedProcessLinkType();
  }

  private resetButtons(): void {
    this.buttonService.disableSaveButton();
    this.buttonService.hideBackButton();
    this.buttonService.hideSaveButton();
    this.buttonService.hideNextButton();
    this.buttonService.disableNextButton();
  }

  private setProcessLinkTypeSteps(processLinkTypeId: string, hasOneOption?: boolean): void {
    switch (processLinkTypeId) {
      case 'form':
        if (hasOneOption) {
          this.processLinkStepService.setSingleFormStep();
          this.buttonService.hideSaveButton();
          this.buttonService.hideBackButton();
        } else {
          this.processLinkStepService.setFormSteps();
          this.buttonService.showSaveButton();
          this.buttonService.showBackButton();
        }
        break;
      case 'form-flow':
        if (hasOneOption) {
          this.processLinkStepService.setSingleFormFlowStep();
          this.buttonService.hideSaveButton();
          this.buttonService.hideBackButton();
        } else {
          this.processLinkStepService.setFormFlowSteps();
          this.buttonService.showSaveButton();
          this.buttonService.showBackButton();
        }
        break;
      case 'plugin':
        if (hasOneOption) {
          this.processLinkStepService.setSingleChoosePluginConfigurationSteps();
          this.buttonService.hideBackButton();
          this.buttonService.showNextButton();
        } else {
          this.processLinkStepService.setChoosePluginConfigurationSteps();
          this.buttonService.showBackButton();
          this.buttonService.showNextButton();
        }
        break;
    }
  }
}
