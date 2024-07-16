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
import {combineLatest, interval, map, Observable, of, Subscription, switchMap, tap} from 'rxjs';
import {ValuePathSelectorCache, ValuePathSelectorPrefix, ValuePathVersionArgument} from '../models';
import {deepmerge} from 'deepmerge-ts';

@Injectable({
  providedIn: 'root',
})
export class ValuePathSelectorService extends BaseApiService implements OnDestroy {
  private _cache: ValuePathSelectorCache = {};

  private readonly _subscriptions = new Subscription();

  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
    this.openClearCacheSubscription();
  }

  public getResolvableKeysPerPrefix(
    prefixes: ValuePathSelectorPrefix[],
    documentDefinitionName: string,
    version: ValuePathVersionArgument = 'latest'
  ): Observable<{[key: string]: string[]}> {
    return combineLatest(
      prefixes.map(prefix => this.getResolvableKeys(prefix, documentDefinitionName, version))
    ).pipe(
      map(results => {
        return results.reduce((acc, curr, index) => ({...acc, [prefixes[index]]: curr}), {});
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private openClearCacheSubscription(): void {
    this._subscriptions.add(
      interval(60 * 1000).subscribe(() => {
        this._cache = {};
      })
    );
  }

  private getResolvableKeys(
    prefix: string,
    documentDefinitionName: string,
    version: ValuePathVersionArgument = 'latest'
  ): Observable<string[]> {
    return of(version).pipe(
      switchMap(version => {
        const resultFromCache = this.getResultFromCache(prefix, documentDefinitionName, version);

        if (!!resultFromCache) return of(resultFromCache);

        return typeof version !== 'number'
          ? this.httpClient.get<string[]>(
              this.getApiUrl(
                `/v1/value-resolver/prefix/${prefix}/document-definition/${documentDefinitionName}/keys`
              )
            )
          : this.httpClient.get<string[]>(
              this.getApiUrl(
                `/v1/value-resolver/prefix/${prefix}/document-definition/${documentDefinitionName}/version/${version}/keys`
              )
            );
      }),
      tap(result => this.cacheResult(prefix, documentDefinitionName, version, result))
    );
  }

  private getResultFromCache(
    prefix: string,
    documentDefinitionName: string,
    version: ValuePathVersionArgument = 'latest'
  ): string[] | null {
    return this._cache[documentDefinitionName]?.[version]?.[prefix] || null;
  }

  private cacheResult(
    prefix: string,
    documentDefinitionName: string,
    version: ValuePathVersionArgument = 'latest',
    result: string[]
  ): void {
    const resultCacheObject: ValuePathSelectorCache = {
      [documentDefinitionName]: {
        [version]: {
          [prefix]: result,
        },
      },
    };

    if (!this.getResultFromCache(prefix, documentDefinitionName, version)) {
      this._cache = deepmerge(this._cache, resultCacheObject);
    }
  }
}
