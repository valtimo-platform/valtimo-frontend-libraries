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
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  startWith,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {
  FormFlowService,
  ProcessLinkButtonService,
  ProcessLinkService,
  ProcessLinkStateService,
} from '../../services';
import {
  FormDefinitionListItem,
  FormDisplayType,
  FormFlowProcessLinkUpdateRequestDto,
  FormSize,
} from '../../models';
import {take} from 'rxjs/operators';

@Component({
  selector: 'valtimo-select-form-flow',
  templateUrl: './select-form-flow.component.html',
  styleUrls: ['./select-form-flow.component.scss'],
})
export class SelectFormFlowComponent implements OnInit, OnDestroy {
  public selectedFormFlowDefinition!: FormDefinitionListItem;
  public formDisplayValue$ = new BehaviorSubject<string>('');
  public formSizeValue$ = new BehaviorSubject<string>('');
  public readonly saving$ = this.stateService.saving$;

  private readonly formFlowDefinitions$ = this.formFlowService.getFormFlowDefinitions();

  private readonly formDisplayOptions = Object.keys(FormDisplayType).map(key => ({
    content: FormDisplayType[key as keyof typeof FormDisplayType],
    id: key,
    selected: false,
  }));

  public readonly formDisplayItems$ = this.stateService.selectedProcessLink$.pipe(
    tap(selectedProcessLink => this.formDisplayValue$.next(selectedProcessLink.formDisplayType)),
    map(selectedProcessLink =>
      this.formDisplayOptions.map(option => ({
        ...option,
        selected: selectedProcessLink?.formDisplayType === option.id,
      }))
    ),
    startWith(this.formDisplayOptions)
  );

  private readonly formSizeOptions = Object.keys(FormSize).map(key => ({
    content: FormSize[key as keyof typeof FormSize],
    id: key,
    selected: false,
  }));

  public readonly formSizeItems$ = this.stateService.selectedProcessLink$.pipe(
    tap(selectedProcessLink => this.formSizeValue$.next(selectedProcessLink.formSize)),
    map(selectedProcessLink =>
      this.formSizeOptions.map(option => ({
        ...option,
        selected: selectedProcessLink?.formSize === option.id,
      }))
    ),
    startWith(this.formSizeOptions)
  );

  public readonly formFlowDefinitionListItems$: Observable<Array<FormDefinitionListItem>> =
    combineLatest([this.stateService.selectedProcessLink$, this.formFlowDefinitions$]).pipe(
      map(([selectedProcessLink, formFlowDefinitions]) =>
        formFlowDefinitions.map(definition => ({
          content: definition.name,
          id: definition.id,
          selected: selectedProcessLink
            ? selectedProcessLink.formFlowDefinitionId === definition.id
            : false,
        }))
      ),
      tap(formFlowDefinitionListItems => {
        const selectedItem = formFlowDefinitionListItems.find(item => item.selected);

        if (selectedItem) {
          this.selectFormFlowDefinition(selectedItem);
        }
      })
    );

  private _subscriptions = new Subscription();

  constructor(
    private readonly formFlowService: FormFlowService,
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

  public selectFormFlowDefinition(formFlowDefinition: FormDefinitionListItem): void {
    if (typeof formFlowDefinition === 'object' && formFlowDefinition.id) {
      this.selectedFormFlowDefinition = formFlowDefinition;
      this.checkCompletedForm();
    } else {
      this.selectedFormFlowDefinition = null;
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
      this.selectedFormFlowDefinition &&
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
        this.saveFormFlowLink();
      })
    );
  }

  private saveFormFlowLink(): void {
    this.stateService.selectedProcessLink$.pipe(take(1)).subscribe(selectedProcessLink => {
      if (selectedProcessLink) {
        this.updateProcessLink();
      } else {
        this.saveNewProcessLink();
      }
    });
  }

  private updateProcessLink(): void {
    this.stateService.selectedProcessLink$.pipe(take(1)).subscribe(selectedProcessLink => {
      const updateProcessLinkRequest: FormFlowProcessLinkUpdateRequestDto = {
        id: selectedProcessLink.id,
        formFlowDefinitionId: this.selectedFormFlowDefinition.id,
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
    combineLatest([this.stateService.modalParams$, this.stateService.selectedProcessLinkTypeId$])
      .pipe(
        take(1),
        switchMap(([modalParams, processLinkTypeId]) =>
          this.processLinkService.saveProcessLink({
            formFlowDefinitionId: this.selectedFormFlowDefinition.id,
            activityType: modalParams.element.activityListenerType,
            processDefinitionId: modalParams.processDefinitionId,
            processLinkType: processLinkTypeId,
            activityId: modalParams.element.id,
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
