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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormService} from '@valtimo/form';
import {combineLatest, map, Observable, Subscription, switchMap, tap} from 'rxjs';
import {
  ProcessLinkButtonService,
  ProcessLinkService,
  ProcessLinkStateService,
} from '../../services';
import {
  FormDefinitionListItem,
  FormDisplayType,
  FormProcessLinkUpdateRequestDto,
  FormSize,
} from '../../models';
import {take} from 'rxjs/operators';

@Component({
  selector: 'valtimo-select-form',
  templateUrl: './select-form.component.html',
  styleUrls: ['./select-form.component.scss'],
})
export class SelectFormComponent implements OnInit, OnDestroy {
  public formDisplayValue: string;
  public formSizeValue: string;

  public readonly formDisplayValues$ = this.stateService.selectedProcessLink$.pipe(
    map(selectedProcessLink => {
      return Object.keys(FormDisplayType).map(key => ({
        content: FormDisplayType[key as keyof typeof FormDisplayType], // Ensures type safety for FormDisplayType keys
        id: key,
        selected: selectedProcessLink ? selectedProcessLink.formDisplayType === key : false,
      }));
    })
  );

  public readonly formSizeValues$ = combineLatest([this.stateService.selectedProcessLink$]).pipe(
    map(([selectedProcessLink]) =>
      Object.keys(FormSize).map(key => ({
        content: FormSize[key],
        id: key,
        selected: selectedProcessLink ? selectedProcessLink.formSize === key : false,
      }))
    )
  );

  public readonly saving$ = this.stateService.saving$;
  private readonly formDefinitions$ = this.formService.getAllFormDefinitions();
  public readonly formDefinitionListItems$: Observable<Array<FormDefinitionListItem>> =
    combineLatest([this.stateService.selectedProcessLink$, this.formDefinitions$]).pipe(
      map(([selectedProcessLink, formDefinitions]) =>
        formDefinitions.map(definition => ({
          content: definition.name,
          id: definition.id,
          selected: selectedProcessLink
            ? selectedProcessLink.formDefinitionId === definition.id
            : false,
        }))
      ),
      tap(formDefinitionListItems => {
        const selectedItem = formDefinitionListItems.find(item => item.selected);

        if (selectedItem) {
          this.selectFormDefinition(selectedItem);
        }
      })
    );

  private _selectedFormDefinition!: FormDefinitionListItem;
  private _subscriptions = new Subscription();

  constructor(
    private readonly formService: FormService,
    private readonly stateService: ProcessLinkStateService,
    private readonly processLinkService: ProcessLinkService,
    private readonly buttonService: ProcessLinkButtonService
  ) {}

  ngOnInit(): void {
    this.openBackButtonSubscription();
    this.openSaveButtonSubscription();
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public selectFormDefinition(formDefinition: FormDefinitionListItem): void {
    if (typeof formDefinition === 'object' && formDefinition.id) {
      this._selectedFormDefinition = formDefinition;
      this.buttonService.enableSaveButton();
    } else {
      this._selectedFormDefinition = null;
      this.buttonService.disableSaveButton();
    }
  }

  public selectFormDisplayType(event): void {
    this.formDisplayValue = event.id;
  }

  public selectFormSize(event): void {
    this.formSizeValue = event.id;
  }

  private openBackButtonSubscription(): void {
    this._subscriptions.add(
      this.buttonService.backButtonClick$.subscribe(() => {
        this.stateService.setInitial();
      })
    );
  }

  private openSaveButtonSubscription(): void {
    this._subscriptions.add(
      this.buttonService.saveButtonClick$.subscribe(() => {
        this.stateService.startSaving();
        this.saveProcessLink();
      })
    );
  }

  private saveProcessLink(): void {
    this.stateService.selectedProcessLink$.pipe(take(1)).subscribe(selectedProcessLink => {
      if (selectedProcessLink) {
        this.updateProcessLink();
      } else {
        this.saveNewProcessLink();
      }
    });
  }

  private updateProcessLink(): void {
    combineLatest([this.stateService.selectedProcessLink$, this.stateService.viewModelEnabled$])
      .pipe(take(1))
      .subscribe(([selectedProcessLink, viewModelEnabled]) => {
        const updateProcessLinkRequest: FormProcessLinkUpdateRequestDto = {
          id: selectedProcessLink.id,
          formDefinitionId: this._selectedFormDefinition.id,
          viewModelEnabled,
          formDisplayType: this.formDisplayValue,
          formSize: this.formSizeValue,
        };

        this.processLinkService.updateProcessLink(updateProcessLinkRequest).subscribe(
          () => {
            this.stateService.closeModal();
          },
          () => {
            this.stateService.stopSaving();
          }
        );
      });
  }

  private saveNewProcessLink(): void {
    combineLatest([
      this.stateService.modalParams$,
      this.stateService.selectedProcessLinkTypeId$,
      this.stateService.viewModelEnabled$,
    ])
      .pipe(
        take(1),
        switchMap(([modalParams, processLinkTypeId, viewModelEnabled]) =>
          this.processLinkService.saveProcessLink({
            formDefinitionId: this._selectedFormDefinition.id,
            activityType: modalParams.element.activityListenerType,
            processDefinitionId: modalParams.processDefinitionId,
            processLinkType: processLinkTypeId,
            activityId: modalParams.element.id,
            viewModelEnabled,
            formDisplayType: this.formDisplayValue,
            formSize: this.formSizeValue,
          })
        )
      )
      .subscribe(
        () => {
          this.stateService.closeModal();
        },
        () => {
          this.stateService.stopSaving();
        }
      );
  }
}
