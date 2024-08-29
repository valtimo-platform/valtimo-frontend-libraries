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
import {BehaviorSubject, combineLatest, map, Observable, Subscription, switchMap, tap} from 'rxjs';
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
  public formDisplayValue$ = new BehaviorSubject<string>('');
  public formSizeValue$ = new BehaviorSubject<string>('');

  public readonly formDisplayValues$ = this.stateService.selectedProcessLink$.pipe(
    tap(selectedProcessLink => this.formDisplayValue$.next(selectedProcessLink.formDisplayType)),
    map(selectedProcessLink => {
      return Object.keys(FormDisplayType).map(key => ({
        content: FormDisplayType[key as keyof typeof FormDisplayType],
        id: key,
        selected: selectedProcessLink ? selectedProcessLink.formDisplayType === key : false,
      }));
    })
  );

  public readonly formSizeValues$ = this.stateService.selectedProcessLink$.pipe(
    tap(selectedProcessLink => this.formSizeValue$.next(selectedProcessLink.formSize)),
    map(selectedProcessLink => {
      return Object.keys(FormSize).map(key => ({
        content: FormSize[key as keyof typeof FormSize],
        id: key,
        selected: selectedProcessLink ? selectedProcessLink.formSize === key : false,
      }));
    })
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

  private selectedFormDefinition!: FormDefinitionListItem;
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
      this.selectedFormDefinition = formDefinition;
      this.checkCompletedForm();
    } else {
      this.selectedFormDefinition = null;
      this.buttonService.disableSaveButton();
    }
  }

  public selectFormDisplayType(event): void {
    if (event.id) {
      this.formDisplayValue$.next(event.id);
      this.checkCompletedForm();
    } else {
      this.formDisplayValue$.next(null);
      this.buttonService.disableSaveButton();
    }
  }

  public selectFormSize(event): void {
    if (event.id) {
      this.formSizeValue$.next(event.id);
      this.checkCompletedForm();
    } else {
      this.formSizeValue$.next(null);
      this.buttonService.disableSaveButton();
    }
  }

  private checkCompletedForm(): void {
    if (
      this.selectedFormDefinition &&
      this.formDisplayValue$.getValue() &&
      this.formSizeValue$.getValue()
    ) {
      this.buttonService.enableSaveButton();
    }
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
          formDefinitionId: this.selectedFormDefinition.id,
          viewModelEnabled,
          formDisplayType: this.formDisplayValue$.getValue(),
          formSize: this.formSizeValue$.getValue(),
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
            formDefinitionId: this.selectedFormDefinition.id,
            activityType: modalParams.element.activityListenerType,
            processDefinitionId: modalParams.processDefinitionId,
            processLinkType: processLinkTypeId,
            activityId: modalParams.element.id,
            viewModelEnabled,
            formDisplayType: this.formDisplayValue$.getValue(),
            formSize: this.formSizeValue$.getValue(),
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
