/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
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

import {Component, TemplateRef, ViewChild} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, startWith, Subject} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';
import {ObjectService} from '../../../../services/object.service';
import {ObjectStateService} from '../../../../services/object-state.service';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FormType} from '../../../../models/object.model';

@Component({
  selector: 'valtimo-object-detail',
  templateUrl: './object-detail.component.html',
  styleUrls: ['./object-detail.component.scss'],
})
export class ObjectDetailComponent {
  readonly loading$ = new BehaviorSubject<boolean>(true);
  readonly currentFormType$ = new BehaviorSubject<FormType>(FormType.SUMMARY);
  readonly submission$ = new BehaviorSubject<any>({});
  readonly formValid$ = new BehaviorSubject<boolean>(false);
  readonly showModal$ = new BehaviorSubject<boolean>(false);
  readonly disableInput$ = new BehaviorSubject<boolean>(false);
  readonly showDeleteModal$ = new Subject<boolean>();
  readonly deleteObjectUrl$ = new BehaviorSubject<string>('');

  private readonly refreshObject$ = new BehaviorSubject<null>(null);

  readonly objectManagementId$: Observable<string> = this.route.params.pipe(map(params => params.objectManagementId));
  readonly objectId$: Observable<string> = this.route.params.pipe(map(params => params.objectId));

  readonly formioForm$: Observable<any> = combineLatest([
    this.objectManagementId$,
    this.objectId$,
    this.currentFormType$,
    this.refreshObject$,
  ]).pipe(
    switchMap(([objectManagementId, objectId, formType]) =>
      this.objectService.getPrefilledObjectFromObjectUrl({objectManagementId, objectId, formType})
    ),
    map(res => res.formDefinition),
    tap(() => this.loading$.next(false))
  );

  constructor(
    private readonly objectService: ObjectService,
    private readonly objectState: ObjectStateService,
    private route: ActivatedRoute,
  ) {}

  saveObject(): void {
    this.disableInput();

    this.updateObject();
  }

  deleteObject(): void {
    this.showDeleteModal$.next(true);
  }

  deleteObjectConfirmation(): void {
    this.disableInput();
  }

  openModal(): void {
    this.showModal$.next(true);
    this.currentFormType$.next(FormType.EDITFORM);
    this.enableInput();
  }

  onFormioChange(formio) {
    if (formio.data != null) {
      this.submission$.next(formio.data)
    }

    this.formValid$.next(formio.isValid);
  }

  closeModal(): void {
    this.showModal$.next(false);
    this.currentFormType$.next(FormType.SUMMARY);
  }

  private updateObject(): void {
    combineLatest([this.submission$, this.formValid$])
      .pipe(take(1))
      .subscribe(([submission, formValid]) => {
        console.log(submission)
        console.log(formValid)
        this.closeModal();
        this.refreshObject();
      });
  }

  private refreshObject(): void {
    this.refreshObject$.next(null);
  }

  private disableInput(): void {
    this.disableInput$.next(true);
  }

  private enableInput(): void {
    this.disableInput$.next(false);
  }
}
