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
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ObjectService} from '../../services/object.service';
import {ObjectStateService} from '../../services/object-state.service';
import {ObjectConfiguration} from '../../models/object.model';

@Component({
  selector: 'valtimo-object-list',
  templateUrl: './object-list.component.html',
  styleUrls: ['./object-list.component.scss'],
})
export class ObjectListComponent {
  readonly loading$ = new BehaviorSubject<boolean>(true);

  readonly fields$ = new BehaviorSubject<Array<{key: string; label: string}>>([]);

  readonly configurationId$: Observable<string> = this.route.params.pipe(map(params => params.documentId));

  readonly objectConfiguration$: Observable<Array<ObjectConfiguration>> = combineLatest([
    this.configurationId$,
    this.translateService.stream('key'),
    this.objectState.refresh$
  ]).pipe(
    tap(() => this.setFields()),
    switchMap(([configurationId]) =>
      this.objectService.getObjectsByConfigurationId(configurationId)
    ),
    tap(() => this.loading$.next(false))
  );

  constructor(
    private readonly objectService: ObjectService,
    private readonly objectState: ObjectStateService,
    private readonly translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  redirectToDetails(object) {
    this.router.navigate([`/object/${object.id}/`]);
  }

  private setFields(): void {
    const keys: Array<string> = ['title'];
    this.fields$.next(keys.map(key => ({label: `${this.translateService.instant(`object.labels.${key}`)}`, key})));
  }
}
