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

import {HttpClient} from '@angular/common/http';
import {Injectable, OnDestroy} from '@angular/core';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {BehaviorSubject, Observable, Subscription, interval, map, of, take, tap} from 'rxjs';
import {
<<<<<<< HEAD
  ValuePathItem,
  ValuePathResponse,
  ValuePathSelectorCache,
  ValuePathSelectorPrefix,
  ValuePathType,
  ValuePathVersionArgument,
=======
  BehaviorSubject,
  catchError,
  combineLatest,
  interval,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
} from 'rxjs';
import {
  ValueCollectionCacheEntry,
  ValuePathCollectionCache,
  ValuePathSelectorCache,
  ValuePathSelectorPrefix,
  ValuePathVersionArgument,
  ValueResolverOption,
  ValueResolverOptionType,
  ValueResolverResult,
>>>>>>> 2d841813 (story: merge next-minor into next-major (#1316))
} from '../models';
import {deepmerge} from 'deepmerge-ts';
import {DocumentDefinitions} from '@valtimo/document';
import {isEqual} from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class ValuePathSelectorService extends BaseApiService implements OnDestroy {
  private _prefixes: ValuePathSelectorPrefix[];
  private _documentDefinitionName: string;
  private _version: ValuePathVersionArgument;

  private _cache: ValuePathSelectorCache = {};
  private _collectionCache: ValuePathCollectionCache = {};
  private _documentDefinitionCache$ = new BehaviorSubject<DocumentDefinitions | null>(null);
  private readonly _subscriptions = new Subscription();

  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
    this.openClearCacheSubscription();
  }

<<<<<<< HEAD
=======
  public getResolvableKeysPerPrefix(
    prefixes: ValuePathSelectorPrefix[],
    documentDefinitionName: string,
    type: ValueResolverOptionType = ValueResolverOptionType.FIELD,
    version: ValuePathVersionArgument = 'latest'
  ): Observable<string[]> {
    return of(version).pipe(
      switchMap(version => {
        const prefixesWithCache = prefixes.filter(
          prefix => !!this.getResultFromCache(prefix, documentDefinitionName, version)
        );
        const resultsFromCache = prefixesWithCache
          .map(prefix => this.getResultFromCache(prefix, documentDefinitionName, version))
          .reduce((acc, curr) => [...acc, ...curr], []);
        const prefixesWithoutCache = prefixes.filter(prefix => !prefixesWithCache.includes(prefix));
        const reqBody: ValueResolverOption = {
          prefixes,
          type,
        };
        const httpCall =
          typeof version !== 'number'
            ? this.httpClient
                .post<
                  ValueResolverResult[]
                >(this.getApiUrl(`/management/v2/value-resolver/document-definition/${documentDefinitionName}/keys`), reqBody)
                .pipe(catchError(() => of([])))
            : this.httpClient
                .post<
                  ValueResolverResult[]
                >(this.getApiUrl(`/management/v2/value-resolver/document-definition/${documentDefinitionName}/version/${version}/keys`), reqBody)
                .pipe(catchError(() => of([])));

        return combineLatest([
          prefixesWithoutCache.length > 0
            ? httpCall.pipe(
                map((results: ValueResolverResult[]) => {
                  if (type === ValueResolverOptionType.COLLECTION)
                    this.cacheCollectionFieldPaths(
                      results,
                      prefixes,
                      documentDefinitionName,
                      version
                    );

                  return type === ValueResolverOptionType.FIELD
                    ? results.map((result: ValueResolverResult) => result.path)
                    : results.reduce((acc, curr) => [...acc, ...this.getCollectionPaths(curr)], []);
                })
              )
            : of([]),
          of(resultsFromCache),
        ]);
      }),
      tap(([results, resultsFromCache]) => {
        const combinedResults = [...results, ...resultsFromCache];
        prefixes.forEach(prefix => {
          const prefixResults = combinedResults.filter(valuePath => valuePath.includes(prefix));
          this.cacheResult(prefix, documentDefinitionName, version, prefixResults);
        });
      }),
      map(([result, resultsFromCache]) => [...result, ...resultsFromCache])
    );
  }

>>>>>>> 2d841813 (story: merge next-minor into next-major (#1316))
  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public setDocumentDefinitionCache(cache: DocumentDefinitions): void {
    this._documentDefinitionCache$.pipe(take(1)).subscribe(currentCache => {
      if (!isEqual(cache, currentCache)) this._documentDefinitionCache$.next(cache);
    });
  }

  public getDocumentDefinitionCache(): Observable<DocumentDefinitions | null> {
    return this._documentDefinitionCache$.asObservable();
  }

<<<<<<< HEAD
  public getResolvableKeys(
    prefixes: ValuePathSelectorPrefix[],
    documentDefinitionName: string,
    type: ValuePathType = ValuePathType.FIELD,
    version: ValuePathVersionArgument = 'latest'
  ): Observable<ValuePathItem[]> {
    this._prefixes = prefixes;
    this._documentDefinitionName = documentDefinitionName;
    this._version = version;

    const url =
      typeof version !== 'number'
        ? `/management/v2/value-resolver/document-definition/${documentDefinitionName}/keys`
        : `/management/v2/value-resolver/document-definition/${documentDefinitionName}/version/${version}/keys`;

    const prefixesWithoutCache: ValuePathSelectorPrefix[] = prefixes.filter(
      (prefix: ValuePathSelectorPrefix) => !this.getCacheResult(prefix, type)
    );

    return (
      prefixesWithoutCache.length > 0
        ? this.httpClient.post<ValuePathResponse[]>(this.getApiUrl(url), {
            prefixes: prefixesWithoutCache,
            type,
          })
        : of([])
    ).pipe(
      tap((results: ValuePathResponse[]) => {
        if (type === ValuePathType.FIELD)
          this.cacheMapping(
            results.map((result: ValuePathResponse) => ({path: result.path})),
            type
          );
        else
          this.cacheMapping(
            results.reduce((acc, curr) => [...acc, ...this.mapCollectionItem(curr)], []),
            type
          );
      }),
      map(() =>
        prefixes.reduce((acc, curr) => [...acc, ...(this.getCacheResult(curr, type) ?? [])], [])
      )
=======
  public getCollectionPathCacheResult(
    prefix: string,
    documentDefinitionName: string,
    version: ValuePathVersionArgument = 'latest',
    collectionKey: string
  ): string[] {
    return (
      this._collectionCache[documentDefinitionName]?.[version]?.[prefix]?.[collectionKey] || []
>>>>>>> 2d841813 (story: merge next-minor into next-major (#1316))
    );
  }

  private openClearCacheSubscription(): void {
    this._subscriptions.add(
      interval(60 * 1000).subscribe(() => {
        this._cache = {};
        this._documentDefinitionCache$.next(null);
      })
    );
  }

  private getCacheResult(
    prefix: ValuePathSelectorPrefix,
    type: ValuePathType
  ): ValuePathItem[] | undefined {
    return this._cache[this._documentDefinitionName]?.[this._version]?.[prefix]?.[type];
  }

  private mapCollectionItem(item: ValuePathResponse, parentPath?: string): ValuePathItem[] {
    const fieldChildren = [];
    const collectionChildren = [];

    item.children.forEach((child: ValuePathResponse) => {
      if (child.type === ValuePathType.FIELD) fieldChildren.push(child);
      else collectionChildren.push(child);
    });

    return [
      {
        path: `${parentPath ?? ''}${item.path}`,
        children: fieldChildren.map((child: ValuePathResponse) => child.path),
      },
      ...collectionChildren.reduce(
        (acc, curr) => [...acc, ...this.mapCollectionItem(curr, `${parentPath ?? ''}${item.path}`)],
        []
      ),
    ];
  }

  private cacheMapping(results: ValuePathItem[], type: ValuePathType): void {
    if (!results.length) return;

    const prefixResults = this._prefixes.reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: {
          [type]: results.filter((result: ValuePathItem) => result.path.split(':')[0] === curr),
        },
      }),
      {}
    );

    const tempCache: ValuePathSelectorCache = {
      [this._documentDefinitionName]: {
        [this._version]: prefixResults,
      },
    };

    this._cache = deepmerge(this._cache, tempCache);
  }

  private getCollectionPaths(result: ValueResolverResult): string[] {
    if (result.type === ValueResolverOptionType.FIELD) return [];

    if (
      !result.children.some(
        (child: ValueResolverResult) => child.type === ValueResolverOptionType.COLLECTION
      )
    )
      return [result.path];

    return result.children.reduce(
      (acc, curr) => [
        ...acc,
        ...this.getCollectionPaths(curr).map(childPath => `${result.path}${childPath}`),
      ],
      []
    );
  }

  private getCollectionCacheResult(
    prefix: string,
    documentDefinitionName: string,
    version: ValuePathVersionArgument = 'latest'
  ): ValueCollectionCacheEntry | null {
    return this._collectionCache[documentDefinitionName]?.[version]?.[prefix] || null;
  }

  private cacheCollectionFieldPaths(
    results: ValueResolverResult[],
    prefixes,
    documentDefinitionName,
    version
  ): void {
    const prefixesWithResult = prefixes.filter((prefix: string) =>
      results.some((result: ValueResolverResult) => result.path.includes(prefix))
    );

    const resultCacheObject: ValuePathCollectionCache = {
      [documentDefinitionName]: {
        [version]: {
          ...prefixesWithResult.reduce(
            (acc, curr) => ({
              ...acc,
              [curr]: {
                ...results
                  .filter((result: ValueResolverResult) => result.path.includes(curr))
                  .reduce((acc, curr) => ({...acc, ...this.getChildrenField(curr)}), {}),
              },
            }),
            {}
          ),
        },
      },
    };

    if (
      prefixesWithResult.some(
        prefix => !this.getCollectionCacheResult(prefix, documentDefinitionName, version)
      )
    )
      this._collectionCache = deepmerge(this._collectionCache, resultCacheObject);
  }

  private getChildrenField(
    result: ValueResolverResult,
    parentPath = ''
  ): ValueCollectionCacheEntry {
    const collectionChildren = result.children?.filter(
      (child: ValueResolverResult) => child.type === ValueResolverOptionType.COLLECTION
    );

    if (!collectionChildren || collectionChildren.length === 0)
      return {
        [`${parentPath}${result.path}`]: result.children.map(
          (child: ValueResolverResult) => child.path
        ),
      };

    return collectionChildren.reduce(
      (collectionEntries, collectionChild) => ({
        ...collectionEntries,
        ...this.getChildrenField(collectionChild, result.path),
      }),
      {}
    );
  }
}
