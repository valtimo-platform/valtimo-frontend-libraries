/*
 * Copyright 2015-2023 Ritense BV, the Netherlands.
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

import {Injectable, OnDestroy} from '@angular/core';
import {DossierParameters} from '../models';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  Subscription,
  take,
} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AssigneeFilter, Direction, SearchFieldValues} from '@valtimo/config';
import {Pagination} from '@valtimo/components';

@Injectable()
export class DossierParameterService implements OnDestroy {
  private readonly _dossierParameters$ = new BehaviorSubject<DossierParameters>(undefined);
  private readonly _searchFieldValues$ = new BehaviorSubject<SearchFieldValues>({});

  get dossierParameters$(): Observable<DossierParameters> {
    return this._dossierParameters$.asObservable();
  }

  get searchFieldValues$(): Observable<SearchFieldValues> {
    return this._searchFieldValues$.asObservable();
  }

  get querySearchParams$(): Observable<SearchFieldValues> {
    return this.route.queryParams.pipe(
      map(params => {
        if (params.search) {
          return JSON.parse(atob(params.search)) as SearchFieldValues;
        }
        return {};
      }),
      distinctUntilChanged(
        (prevParams, currParams) => JSON.stringify(prevParams) === JSON.stringify(currParams)
      )
    );
  }

  get queryPaginationParams$(): Observable<Pagination | null> {
    return this.route.queryParams.pipe(
      map(params => {
        const paramsCopy = {...params} as any as DossierParameters;

        if (paramsCopy.search) {
          delete paramsCopy.search;
        }

        console.log('params copy', paramsCopy);

        return paramsCopy.collectionSize
          ? {
              collectionSize: Number(paramsCopy.collectionSize),
              page: Number(paramsCopy.page),
              size: Number(paramsCopy.size),
              maxPaginationItemSize: Number(paramsCopy.maxPaginationItemSize),
              ...(paramsCopy.isSorting === 'true' && {
                sort: {
                  isSorting: !!(paramsCopy.isSorting === 'true'),
                  state: {
                    name: paramsCopy.sortStateName,
                    direction: paramsCopy.sortStateDirection as Direction,
                  },
                },
              }),
            }
          : null;
      }),
      distinctUntilChanged(
        (prevParams, currParams) => JSON.stringify(prevParams) === JSON.stringify(currParams)
      )
    );
  }

  get queryAssigneeParam$(): Observable<AssigneeFilter> {
    return this.route.queryParams.pipe(
      map(params => {
        if (params?.assignee) {
          return params?.assignee?.toUpperCase();
        }
        return '';
      }),
      distinctUntilChanged((prevParams, currParams) => prevParams === currParams)
    );
  }

  dossierParametersSubscription!: Subscription;

  constructor(private readonly router: Router, private readonly route: ActivatedRoute) {
    this.setDossierParameters();
    // this.openDossierParametersSubscription();
  }

  ngOnDestroy(): void {
    this.dossierParametersSubscription?.unsubscribe();
  }

  setSearchFieldValues(searchFieldValues: SearchFieldValues): void {
    this._searchFieldValues$.next(searchFieldValues);
  }

  setSearchParameters(searchParameters: SearchFieldValues): void {
    console.log('set param: search', searchParameters);
    this._dossierParameters$.pipe(take(1)).subscribe(dossierParameters => {
      if (Object.keys(searchParameters || {}).length > 0) {
        this._dossierParameters$.next({
          ...dossierParameters,
          search: this.objectToBase64(searchParameters),
        });
      } else {
        if (dossierParameters?.search) {
          delete dossierParameters.search;
        }
        this._dossierParameters$.next(dossierParameters);
      }
    });
  }

  setPaginationParameters(pagination: Pagination): void {
    console.log('set param: pagination', pagination);
    if (pagination) {
      this._dossierParameters$.pipe(take(1)).subscribe(dossierParameters => {
        this._dossierParameters$.next({
          ...dossierParameters,
          size: `${pagination.size}`,
          collectionSize: `${pagination.collectionSize}`,
          page: `${pagination.page}`,
          maxPaginationItemSize: `${pagination.maxPaginationItemSize}`,
          isSorting: pagination.sort?.isSorting ? 'true' : 'false',
          ...(pagination.sort?.state?.name && {sortStateName: `${pagination.sort?.state.name}`}),
          ...(pagination.sort?.state?.direction && {
            sortStateDirection: `${pagination.sort?.state.direction}`,
          }),
        });
      });
    }
  }

  setAssigneeParameter(assigneeFilter: AssigneeFilter): void {
    console.log('set param: assignee', assigneeFilter);
    this._dossierParameters$.pipe(take(1)).subscribe(dossierParameters => {
      this._dossierParameters$.next({
        ...dossierParameters,
        assignee: assigneeFilter.toLowerCase(),
      });
    });
  }

  private openDossierParametersSubscription(): void {
    this.dossierParametersSubscription = this.dossierParameters$.subscribe(dossierParams => {
      this.router.navigate([this.getUrlWithoutParams()], {queryParams: dossierParams});
    });
  }

  private objectToBase64(jsObject: object): string {
    return btoa(JSON.stringify(jsObject));
  }

  private getUrlWithoutParams(): string {
    const urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    urlTree.fragment = null;
    return urlTree.toString();
  }

  private setDossierParameters(): void {
    combineLatest([this.queryPaginationParams$, this.querySearchParams$, this.queryAssigneeParam$])
      .pipe(take(1))
      .subscribe(([paginationParams, searchParams, assigneeParams]) => {
        if (paginationParams) {
          this.setPaginationParameters(paginationParams);
        }
        if (searchParams) {
          console.log('first set search params', searchParams);
          this.setSearchParameters(searchParams);
          this.setSearchFieldValues(searchParams);
        }
        if (assigneeParams) {
          this.setAssigneeParameter(assigneeParams);
        }

        this.openDossierParametersSubscription();
      });
  }
}
