import {Injectable, OnDestroy} from '@angular/core';
import {DossierParameters} from '../models';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  Subscription,
  take,
} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {Direction, SearchFieldValues} from '@valtimo/config';
import {Pagination} from '@valtimo/components';

@Injectable({
  providedIn: 'root',
})
export class DossierParameterService implements OnDestroy {
  private readonly _dossierParameters$ = new BehaviorSubject<DossierParameters>(undefined);

  get dossierParameters$(): Observable<DossierParameters> {
    return this._dossierParameters$.asObservable();
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

  get queryPaginationParams$(): Observable<Pagination> {
    return this.route.queryParams.pipe(
      filter(params => params.collectionSize),
      map(params => {
        const paramsCopy = {...params} as any as DossierParameters;

        if (paramsCopy.search) {
          delete paramsCopy.search;
        }

        return {
          collectionSize: Number(paramsCopy.collectionSize),
          page: Number(paramsCopy.page),
          size: Number(paramsCopy.size),
          maxPaginationItemSize: Number(paramsCopy.maxPaginationItemSize),
          ...(paramsCopy.isSorting === 'true' && {
            isSorting: !!(paramsCopy.isSorting === 'true'),
            state: {
              name: paramsCopy.sortStateName,
              direction: paramsCopy.sortStateDirection as Direction,
            },
          }),
        };
      }),
      distinctUntilChanged(
        (prevParams, currParams) => JSON.stringify(prevParams) === JSON.stringify(currParams)
      )
    );
  }

  dossierParametersSubscription!: Subscription;

  constructor(private readonly router: Router, private readonly route: ActivatedRoute) {
    this.openDossierParametersSubscription();
  }

  ngOnDestroy(): void {
    this.dossierParametersSubscription?.unsubscribe();
  }

  setSearchParameters(searchParameters: SearchFieldValues): void {
    this._dossierParameters$.pipe(take(1)).subscribe(dossierParameters => {
      if (Object.keys(searchParameters || {}).length > 0) {
        this._dossierParameters$.next({
          ...dossierParameters,
          search: this.objectToBase64(searchParameters),
        });
      } else {
        delete dossierParameters.search;
        this._dossierParameters$.next(dossierParameters);
      }
    });
  }

  setPaginationParameters(pagination: Pagination): void {
    if (pagination) {
      this._dossierParameters$.pipe(take(1)).subscribe(dossierParameters => {
        this._dossierParameters$.next({
          ...dossierParameters,
          size: `${pagination.size}`,
          collectionSize: `${pagination.collectionSize}`,
          page: `${pagination.page}`,
          maxPaginationItemSize: `${pagination.maxPaginationItemSize}`,
          sortStateName: `${pagination.sort?.state.name}`,
          sortStateDirection: `${pagination.sort?.state.direction}`,
          isSorting: pagination.sort.isSorting ? 'true' : 'false',
        });
      });
    }
  }

  private openDossierParametersSubscription(): void {
    this.dossierParametersSubscription = this.dossierParameters$.subscribe(queryParams => {
      this.router.navigate([this.getUrlWithoutParams()], {queryParams});
    });
  }

  private objectToBase64(jsObject: object): string {
    return btoa(JSON.stringify(jsObject));
  }

  private getUrlWithoutParams(): string {
    let urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams = {};
    urlTree.fragment = null;
    return urlTree.toString();
  }
}
