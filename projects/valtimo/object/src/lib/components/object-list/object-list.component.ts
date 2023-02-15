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
import {BehaviorSubject, combineLatest, map, Observable, startWith, Subject} from 'rxjs';
import {switchMap, take, tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ObjectService} from '../../services/object.service';
import {ObjectStateService} from '../../services/object-state.service';
import {Pagination} from '@valtimo/components';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'valtimo-object-list',
  templateUrl: './object-list.component.html',
  styleUrls: ['./object-list.component.scss'],
})
export class ObjectListComponent {
  readonly loading$ = new BehaviorSubject<boolean>(true);

  readonly fields$ = new BehaviorSubject<Array<{key: string; label: string}>>([]);

  readonly objectManagementId$: Observable<string> = this.route.params.pipe(map(params => params.objectManagementId));

  readonly showModal$ = new BehaviorSubject<boolean>(false);
  readonly disableInput$ = new BehaviorSubject<boolean>(false);
  private readonly refreshObjectList$ = new BehaviorSubject<null>(null);

  readonly formGroup = new FormGroup({
    key: new FormControl('', Validators.required),
  });

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

  readonly valid$ = this.formGroup.valueChanges.pipe(
    map(formValues => formValues.key !== undefined),
    startWith(false)
  );

  readonly objectConfiguration$: Observable<Array<any>> = combineLatest([
    this.objectManagementId$,
    this.currentPageAndSize$,
    this.translateService.stream('key'),
    this.objectState.refresh$
  ]).pipe(
    tap(() => this.setFields()),
    switchMap(([objectManagementId, currentPage]) =>
      this.objectService.getObjectsByObjectManagementId(objectManagementId, {page: currentPage.page, size: currentPage.size})
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

  readonly createObject$: Observable<any> = combineLatest([
    this.objectManagementId$
  ]).pipe(
    switchMap(([objectManagementId]) => this.objectService.createObject({objectManagementId}))
  )

  constructor(
    private readonly objectService: ObjectService,
    private readonly objectState: ObjectStateService,
    private readonly translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  openModal(): void {
    this.showModal$.next(true);
  }

  closeModal(): void {
    this.showModal$.next(false);
  }

  addObject(): void {
    this.disableInput();
  }


  redirectToDetails(record) {
    const objectId = record.objectUrl.split("/").pop();
    this.objectManagementId$.pipe(take(1)).subscribe(configurationId => {
      this.router.navigate([`/object/${configurationId}/${objectId}`]);
    })
  }

  private refreshObjectList(): void {
    this.refreshObjectList$.next(null);
  }

  private disableInput(): void {
    this.disableInput$.next(true);
    this.formGroup.disable();
  }

  private enableInput(): void {
    this.disableInput$.next(false);
    this.formGroup.enable();
  }


  private setFields(): void {
    const keys: Array<string> = ['recordIndex', 'objectUrl'];
    this.fields$.next(keys.map(key => ({label: `${this.translateService.instant(`object.labels.${key}`)}`, key})));
  }
}
