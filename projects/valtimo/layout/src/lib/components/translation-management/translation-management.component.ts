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

import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, switchMap, tap} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {GlobalSettingsService} from '@valtimo/config';
import {ArbitraryInputTitles, MultiInputArbitraryValue} from '@valtimo/components';

@Component({
  selector: 'valtimo-translation-management',
  templateUrl: './translation-management.component.html',
  styleUrls: ['./translation-management.component.scss'],
})
export class TranslationManagementComponent implements OnInit {
  public readonly loading$ = new BehaviorSubject<boolean>(true);

  private readonly _languageOptions$ = new BehaviorSubject<Array<string>>(undefined);
  private readonly _refreshGlobalSettings$ = new BehaviorSubject<null>(null);
  private readonly _globalSettingsTranslations$ = this._refreshGlobalSettings$.pipe(
    tap(() => this.loading$.next(true)),
    switchMap(() => this.globalSettingsService.getGlobalSettingsTranslations()),
    tap(() => this.loading$.next(false))
  );

  public readonly globalSettingsTranslationValues$: Observable<Array<MultiInputArbitraryValue>> =
    combineLatest([
      this._globalSettingsTranslations$,
      this._languageOptions$,
      this.translateService.stream('key'),
    ]).pipe(
      map(([globalSettingsTranslations, languageOptions]) => {
        const firstLanguageOption = languageOptions[0];
        const firstLanguageTranslations =
          firstLanguageOption && globalSettingsTranslations[firstLanguageOption];
        const flattenedFirstLanguageTranslations =
          firstLanguageTranslations && this.flattenObject(firstLanguageTranslations);

        return Object.keys(flattenedFirstLanguageTranslations).map(flattenedTranslationKey => {
          const emptyArbitraryValue = {};

          emptyArbitraryValue['0'] = flattenedTranslationKey;

          languageOptions.forEach((languageOption, index) => {
            emptyArbitraryValue[`${index + 1}`] = this.flattenObject(
              globalSettingsTranslations[languageOption]
            )[flattenedTranslationKey];
          });

          return emptyArbitraryValue;
        });
      }),
      tap(res => console.log('returned', res))
    );

  public readonly multiInputTiles$: Observable<ArbitraryInputTitles> = combineLatest([
    this._languageOptions$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([languageOptions]) => {
      const objToReturn = {};
      objToReturn[0] = this.translateService.instant('listColumn.key');

      languageOptions.forEach((languageOption, index) => {
        objToReturn[index + 1] = this.translateService.instant(
          `settings.language.options.${languageOption}`
        );
      });

      return objToReturn;
    })
  );

  public readonly amountOfArbitraryValues$: Observable<number> = this.multiInputTiles$.pipe(
    map(multiInputTitles => Object.keys(multiInputTitles).length)
  );

  constructor(
    private readonly translateService: TranslateService,
    private readonly globalSettingsService: GlobalSettingsService
  ) {}

  public ngOnInit(): void {
    this.setLanguages();
  }

  private setLanguages(): void {
    this._languageOptions$.next(this.translateService.langs);
    console.log(this._languageOptions$.getValue());
  }

  private flattenObject = (ob: object): object => {
    var toReturn = {};

    for (const i in ob) {
      if (!ob.hasOwnProperty(i)) continue;

      if (typeof ob[i] == 'object' && ob[i] !== null) {
        const flatObject = this.flattenObject(ob[i]);
        for (var x in flatObject) {
          if (!flatObject.hasOwnProperty(x)) continue;

          toReturn[i + '.' + x] = flatObject[x];
        }
      } else {
        toReturn[i] = ob[i];
      }
    }
    return toReturn;
  };

  private unflattenObject = (obj: object, delimiter = '.'): object =>
    Object.keys(obj).reduce((res, k) => {
      k.split(delimiter).reduce(
        (acc, e, i, keys) =>
          acc[e] ||
          (acc[e] = isNaN(Number(keys[i + 1])) ? (keys.length - 1 === i ? obj[k] : {}) : []),
        res
      );
      return res;
    }, {});
}
