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
import {BehaviorSubject, Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {ObjectManagementService} from '../../services/object-management.service';
import {ObjectManagement} from '../../models/object-management.model';

@Component({
  selector: 'valtimo-objecttypes-management',
  templateUrl: './objecttypes-management.component.html',
  styleUrls: ['./objecttypes-management.component.scss'],
})
export class ObjecttypesManagementComponent {
  readonly loading$ = new BehaviorSubject<boolean>(true);

  readonly fields$ = new BehaviorSubject<Array<{key: string; label: string}>>([]);

  readonly objecttypesInstances$: Observable<Array<ObjectManagement>> = this.translateService.stream('key').pipe(
    tap(() => this.setFields()),
    switchMap(() =>
      this.objectManagementService.getAllObjects()
    ),
    tap(() => this.loading$.next(false))
  );

  constructor(
    private readonly objectManagementService: ObjectManagementService,
    private readonly translateService: TranslateService,
  ) {}


  private setFields(): void {
    const keys: Array<string> = ['title'];
    this.fields$.next(keys.map(key => ({label: `${this.translateService.instant(`objectManagement.labels.${key}`)}`, key})));
  }
}
