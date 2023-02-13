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
import {switchMap, take, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ObjectService} from '../../services/object.service';
import {ObjectStateService} from '../../services/object-state.service';
import {ObjectConfiguration, ObjectConfigurationItem} from '../../models/object.model';
import {Pagination} from '@valtimo/components';

@Component({
  selector: 'valtimo-object-list',
  templateUrl: './object-list.component.html',
  styleUrls: ['./object-list.component.scss'],
})
export class ObjectListComponent {
  readonly loading$ = new BehaviorSubject<boolean>(true);

  readonly fields$ = new BehaviorSubject<Array<{key: string; label: string}>>([]);

  readonly configurationId$: Observable<string> = this.route.params.pipe(map(params => params.configurationId));

  readonly currentPageAndSize$ = new BehaviorSubject<Partial<Pagination>>({
    page: 0,
    size: 10,
  });

  readonly pageSizes$ = new BehaviorSubject<Partial<Pagination>>({
    collectionSize: 0,
    maxPaginationItemSize: 5,
  });

  readonly pagination$: Observable<Pagination> = combineLatest([
    this.currentPageAndSize$,
    this.pageSizes$,
  ]).pipe(
    map(
      ([currentPage, sizes]) =>
        ({...currentPage, ...sizes, page: currentPage.page + 1} as Pagination)
    )
  );

  paginationClicked(newPageNumber): void {
    this.currentPageAndSize$.pipe(take(1)).subscribe(currentPage => {
      this.currentPageAndSize$.next({...currentPage, page: newPageNumber - 1});
    });
  }

  paginationSet(newPageSize): void {
    if (newPageSize) {
      this.currentPageAndSize$.pipe(take(1)).subscribe(currentPage => {
        this.currentPageAndSize$.next({...currentPage, size: newPageSize});
      });
    }
  }

  readonly objectConfiguration$: Observable<Array<any>> = combineLatest([
    this.configurationId$,
    this.currentPageAndSize$,
    this.translateService.stream('key'),
    this.objectState.refresh$
  ]).pipe(
    tap(() => this.setFields()),
    switchMap(([configurationId, currentPage]) =>
      this.objectService.getObjectsByConfigurationId(configurationId, {page: currentPage.page, size: currentPage.size})
    ),
    tap(instanceRes => {
      this.pageSizes$.pipe(take(1)).subscribe(sizes => {
        // @ts-ignore
        this.pageSizes$.next({...sizes, collectionSize: instanceRes.totalElements});
      });
    }),
    map(res => {
      return res.content.map(record => ({
        objectUrl: record.items[0].value,
        recordIndex: record.items[1].value
      }));
    }),
    tap(() => this.loading$.next(false))
  );

  constructor(
    private readonly objectService: ObjectService,
    private readonly objectState: ObjectStateService,
    private readonly translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  redirectToDetails(record) {
    const objectId = record.objectUrl.split("/").pop();
    this.configurationId$.pipe(take(1)).subscribe(configurationId => {
      this.router.navigate([`/object/${configurationId}/${objectId}`]);
    })
    //
  }

  private setFields(): void {
    const keys: Array<string> = ['recordIndex', 'objectUrl'];
    this.fields$.next(keys.map(key => ({label: `${this.translateService.instant(`object.labels.${key}`)}`, key})));
  }
}
