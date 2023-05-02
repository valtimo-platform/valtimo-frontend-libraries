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
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {ProcessLinkType} from '../models';
import {ProcessLinkStepService} from './process-link-step.service';

@Injectable()
export class ProcessLinkState2Service implements OnDestroy {
  private readonly _showModal$ = new BehaviorSubject<boolean>(false);
  private readonly _availableProcessLinkTypes$ = new BehaviorSubject<Array<ProcessLinkType>>([]);
  private readonly _elementName$ = new BehaviorSubject<string>('');
  private readonly _selectedProcessLinkTypeId$ = new BehaviorSubject<string>('');
  private readonly _showSaveButton$ = new BehaviorSubject<boolean>(false);
  private readonly _enableSaveButton$ = new BehaviorSubject<boolean>(false);
  private readonly _showBackButton$ = new BehaviorSubject<boolean>(false);
  private readonly _backButtonClick$ = new Subject<null>();
  private readonly _saveButtonClick$ = new Subject<null>();
  private readonly _hasOneOption$ = new BehaviorSubject<boolean>(false);

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
  get showSaveButton$(): Observable<boolean> {
    return this._showSaveButton$.asObservable();
  }
  get enableSaveButton$(): Observable<boolean> {
    return this._enableSaveButton$.asObservable();
  }
  get showBackButton$(): Observable<boolean> {
    return this._showBackButton$.asObservable();
  }
  get backButtonClick$(): Observable<null> {
    return this._backButtonClick$.asObservable();
  }
  get saveButtonClick$(): Observable<null> {
    return this._saveButtonClick$.asObservable();
  }

  get hasOneOption$(): Observable<boolean> {
    return this._hasOneOption$.asObservable();
  }

  constructor(private readonly processLinkStepService: ProcessLinkStepService) {
    this.openAvailableProcessLinkTypesSubscription();
  }

  ngOnDestroy(): void {
    this._availableProcessLinkTypesSubscription?.unsubscribe();
  }

  setAvailableProcessLinkTypes(processLinkTypes: Array<ProcessLinkType>): void {
    const hasOneOption = processLinkTypes.length === 1;
    this._availableProcessLinkTypes$.next(processLinkTypes);
    this._hasOneOption$.next(hasOneOption);

    if (hasOneOption) {
      this.selectProcessLinkType(processLinkTypes[0].processLinkType);
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

  selectProcessLinkType(processLinkTypeId: string): void {
    this._selectedProcessLinkTypeId$.next(processLinkTypeId);
    this.setProcessLinkTypeSteps(processLinkTypeId);
  }

  showSaveButton(): void {
    this._showSaveButton$.next(true);
  }

  hideSaveButton(): void {
    this._showSaveButton$.next(false);
  }

  enableSaveButton(): void {
    this._enableSaveButton$.next(true);
  }

  disableSaveButton(): void {
    this._enableSaveButton$.next(false);
  }

  showBackButton(): void {
    this._showBackButton$.next(true);
  }

  hideBackButton(): void {
    this._showBackButton$.next(false);
  }

  clickBackButton(): void {
    this._backButtonClick$.next(null);
  }

  clickSaveButton(): void {
    this._saveButtonClick$.next(null);
  }

  setInitial(): void {
    const availableTypes = this._availableProcessLinkTypes$.getValue();
    this.resetButtons();
    this.processLinkStepService.setInitialSteps(availableTypes);
  }

  private openAvailableProcessLinkTypesSubscription(): void {
    this._availableProcessLinkTypesSubscription = this._availableProcessLinkTypes$.subscribe(() => {
      this.setInitial();
    });
  }
  private reset(): void {
    this.setAvailableProcessLinkTypes([]);
    this.processLinkStepService.reset();
    this.resetButtons();
  }

  private resetButtons(): void {
    this.disableSaveButton();
    this.hideBackButton();
    this.hideSaveButton();
  }

  private setProcessLinkTypeSteps(processLinkTypeId: string): void {
    switch (processLinkTypeId) {
      case 'form':
        this.showSaveButton();
        this.showBackButton();
        this.processLinkStepService.setFormSteps();
        break;
    }
  }
}
