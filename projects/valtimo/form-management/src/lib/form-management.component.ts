/*
 * Copyright 2015-2025 Ritense BV, the Netherlands.
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
import {ActivatedRoute, Router} from '@angular/router';
import {ColumnConfig, Pagination} from '@valtimo/components';
import {BehaviorSubject, combineLatest, map, Observable, of, switchMap, tap} from 'rxjs';
import {Upload16} from '@carbon/icons';

import {FormDefinition, FormManagementParams} from './models';
import {FormManagementService} from './services';
import {IconService} from 'carbon-components-angular';

@Component({
  selector: 'valtimo-form-management',
  templateUrl: './form-management.component.html',
  styleUrls: ['./form-management.component.scss'],
})
export class FormManagementComponent {
  public readonly loading$ = new BehaviorSubject<boolean>(true);
  public readonly searchTerm$ = new BehaviorSubject<string>('');

  public readonly caseManagementRouteParams$: Observable<FormManagementParams | null> =
    this.route.parent?.params.pipe(
      map(({caseDefinitionName, caseVersionTag}) =>
        caseDefinitionName && caseVersionTag
          ? {
              definitionName: caseDefinitionName,
              versionTag: caseVersionTag,
            }
          : null
      )
    ) || of(null);

  public readonly pagination$ = new BehaviorSubject<Pagination>({
    collectionSize: 0,
    page: 1,
    size: 10,
  });

  public readonly formDefinitions$ = combineLatest([
    this.caseManagementRouteParams$,
    this.pagination$,
    this.searchTerm$,
  ]).pipe(
    switchMap(([routeParams, pagination, searchTerm]) => {
      console.log(routeParams, pagination, searchTerm);
      const params = {
        ...pagination,
        pagination: pagination.page - 1,
        ...(searchTerm && {searchTerm}),
      };

      if (!routeParams?.definitionName || !routeParams?.versionTag) return;

      return this.formManagementService.queryFormDefinitionsCase(
        routeParams.definitionName,
        routeParams.versionTag,
        params
      );
    }),
    tap(() => this.loading$.next(false))
  );

  public readonly FIELDS: ColumnConfig[] = [
    {key: 'name', label: 'Form name'},
    {key: 'readOnly', label: 'Read-only'},
  ];

  constructor(
    private readonly formManagementService: FormManagementService,
    private readonly iconService: IconService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.iconService.registerAll([Upload16]);
  }

  public paginationClicked(page: number): void {
    this.updatePagination({page});
  }

  public paginationSet(size: number): void {
    this.updatePagination({size, page: 1});
  }

  public editFormDefinition(formDefinition: FormDefinition): void {
    this.router.navigate(['/form-management/edit', formDefinition.id]);
  }

  public searchTermEntered(searchTerm: string): void {
    this.searchTerm$.next(searchTerm);
  }

  private updatePagination(update: Partial<Pagination>): void {
    this.pagination$.next({...this.pagination$.getValue(), ...update});
  }
}
