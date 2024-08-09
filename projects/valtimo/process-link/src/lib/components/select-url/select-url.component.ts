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
import {combineLatest, map, Observable, Subscription, switchMap, tap} from 'rxjs';
import {
  ProcessLinkButtonService,
  ProcessLinkStateService,
  ProcessLinkService,
} from '../../services';
import {distinctUntilChanged, take} from 'rxjs/operators';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {URLProcessLinkUpdateRequestDto} from '../../models';

@Component({
  selector: 'valtimo-select-url',
  templateUrl: './select-url.component.html',
  styleUrls: ['./select-url.component.scss'],
})
export class SelectUrlComponent implements OnInit, OnDestroy {
  public readonly saving$ = this.stateService.saving$;

  private _subscriptions = new Subscription();

  public urlForm: FormGroup;

  constructor(
    private readonly stateService: ProcessLinkStateService,
    private readonly buttonService: ProcessLinkButtonService,
    private readonly processLinkService: ProcessLinkService
  ) {
  }

  ngOnInit(): void {
    this.openBackButtonSubscription();
    this.openSaveButtonSubscription();

    this.urlForm = new FormGroup({
      url: new FormControl("", [Validators.required, urlValidator()])
    })
    this.urlForm.statusChanges
      .pipe(distinctUntilChanged())
      .subscribe(status => {
        if(status === 'VALID') {
          this.buttonService.enableSaveButton();
        } else {
          this.buttonService.disableSaveButton();
        }
      })

    this.stateService.url$.subscribe(url =>
      this.url.setValue(url)
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
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
        const updateProcessLinkRequest: URLProcessLinkUpdateRequestDto = {
          id: selectedProcessLink.id,
          url: this.url.value,
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
      this.stateService.selectedProcessLinkTypeId$
    ])
      .pipe(
        take(1),
        switchMap(([modalParams, processLinkTypeId]) =>
        this.processLinkService.saveProcessLink({
          url: this.url.value,
          activityType: modalParams.element.activityListenerType,
          processDefinitionId: modalParams.processDefinitionId,
          processLinkType: processLinkTypeId,
          activityId: modalParams.element.id
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

  get url() {
    return this.urlForm.get('url');
  }
}

export function urlValidator(): ValidatorFn {
return (control: AbstractControl): ValidationErrors | null => {
  try {
    new URL(control.value);
    return null;
  } catch (_) {
    return { invalidUrl: { value: control.value } };
  }
}
}
