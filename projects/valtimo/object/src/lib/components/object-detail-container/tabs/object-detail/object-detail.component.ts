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

import {Component} from '@angular/core';
import {BehaviorSubject, combineLatest, delay, map, Observable, startWith, Subject} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';
import {ObjectService} from '../../../../services/object.service';
import {ObjectStateService} from '../../../../services/object-state.service';
import {ActivatedRoute} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'valtimo-object-detail',
  templateUrl: './object-detail.component.html',
  styleUrls: ['./object-detail.component.scss'],
})
export class ObjectDetailComponent {
  readonly loading$ = new BehaviorSubject<boolean>(true);
  readonly showModal$ = new BehaviorSubject<boolean>(false);
  readonly disableInput$ = new BehaviorSubject<boolean>(false);
  readonly showDeleteModal$ = new Subject<boolean>();
  readonly deleteObjectUrl$ = new BehaviorSubject<string>('');

  private readonly refreshObject$ = new BehaviorSubject<null>(null);

  readonly formGroup = new FormGroup({
    key: new FormControl('', Validators.required),
  });

  readonly objectUrl$: Observable<string> = this.route.params.pipe(map(params => {
    console.log(params)
    return params.objectUrl
  }));

  readonly valid$ = this.formGroup.valueChanges.pipe(
    map(formValues => formValues.key !== undefined),
    startWith(false)
  );

  readonly prefilledObjectFromObjectUrl$: Observable<Array<any>> = combineLatest([
    this.objectUrl$,
    this.refreshObject$,
  ]).pipe(
    switchMap(([objectUrl]) =>
      this.objectService.getPrefilledObjectFromObjectUrl({objectUrl: 'http://localhost:8010/api/v2/objects/1017c4c4-24c1-47b4-8f61-3b45a56f3054'})
    ),
    map(res => {
      console.log(res);
      return null;
    }),
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
    this.objectUrl$.pipe(take(1)).subscribe(objectUrl => {
      this.deleteObjectUrl$.next(objectUrl);
    })
  }

  deleteObjectConfirmation(): void {
    this.disableInput();
  }

  openModal(): void {
    this.showModal$.next(true);
  }

  closeModal(): void {
    this.showModal$.next(false);
  }

  private updateObject(): void {
  }

  private refreshObject(): void {
    this.refreshObject$.next(null);
  }

  private disableInput(): void {
    this.disableInput$.next(true);
    this.formGroup.disable();
  }

  private enableInput(): void {
    this.disableInput$.next(false);
    this.formGroup.enable();
  }
}
