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
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  Subscription,
  tap,
} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DossierColumnService} from '../services';
import {Documents, SpecifiedDocuments} from '@valtimo/document';

@Injectable()
export class DossierListService implements OnDestroy {
  private readonly _documentDefinitionName$ = new BehaviorSubject<string>('');

  private readonly _hasEnvColumnConfig$: Observable<boolean> = this.documentDefinitionName$.pipe(
    map(documentDefinitionName =>
      this.dossierColumnService.hasEnvironmentConfig(documentDefinitionName)
    )
  );

  get documentDefinitionName$(): Observable<string> {
    return this._documentDefinitionName$.pipe(distinctUntilChanged());
  }

  get hasEnvColumnConfig$(): Observable<boolean> {
    return this._hasEnvColumnConfig$;
  }

  private routeSubscription!: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dossierColumnService: DossierColumnService
  ) {
    this.openRouteSubscription();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  mapDocuments(
    documents: Documents | SpecifiedDocuments,
    hasEnvColumnConfig: boolean,
    hasApiColumnConfig: boolean
  ) {
    if (hasEnvColumnConfig || !hasApiColumnConfig) {
      const docsToMap = documents as Documents;
      return docsToMap.content.map(document => {
        const {content, ...others} = document;
        return {...content, ...others};
      });
    } else {
      const docsToMap = documents as SpecifiedDocuments;
      return docsToMap.content.reduce((acc, curr) => {
        const propsObject = {id: curr.id};
        curr.items.forEach(item => {
          propsObject[item.key] = item.value;
        });
        return [...acc, propsObject];
      }, []);
    }
  }

  private openRouteSubscription(): void {
    this.routeSubscription = this.route.params
      .pipe(
        map(params => params?.documentDefinitionName),
        filter(docDefName => !!docDefName),
        tap(documentDefinitionName => {
          this._documentDefinitionName$.next(documentDefinitionName);
        })
      )
      .subscribe();
  }
}
