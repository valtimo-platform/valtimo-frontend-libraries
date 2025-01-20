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
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, HostBinding, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {CarbonListModule, ColumnConfig, ViewType} from '@valtimo/components';
import {LoadingModule} from 'carbon-components-angular';
import {BehaviorSubject, map, Observable, switchMap, tap} from 'rxjs';
import {Person} from '../../../../models';
import {PersonApiService} from '../../../../services';
import {PersonCardComponent} from '../../person-card/person-card.component';

@Component({
  selector: 'valtimo-panorama-family-tab',
  templateUrl: './family.component.html',
  styleUrl: './family.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, PersonCardComponent, TranslateModule, CarbonListModule, LoadingModule],
})
export class FamilyTabComponent {
  @HostBinding('class') public readonly class = 'valtimo-panorama-family-tab';
  public readonly person$: Observable<Person | null> = this.route.paramMap.pipe(
    switchMap((params: ParamMap) => this.personApiService.getPersonDetails(params.get('bsn')))
  );

  public readonly loading$ = new BehaviorSubject<boolean>(true);
  public readonly CHILDREN_FIELDS: ColumnConfig[] = [
    {
      key: 'burgerservicenummer',
      label: 'BSN',
      viewType: ViewType.TEXT,
    },
    {
      key: 'fullName',
      label: 'panorama.columns.fullName',
      viewType: ViewType.TEXT,
    },
    {
      key: 'dateOfBirth',
      label: 'panorama.columns.dateOfBirth',
      viewType: ViewType.DATE,
      format: 'DD/MM/YYYY',
    },
  ];

  public readonly children$: Observable<
    (Partial<Person> & {fullName: string; dateOfBirth: string})[]
  > = this.person$.pipe(
    tap(() => this.loading$.next(true)),
    map((person: Person | null) =>
      !person
        ? []
        : person.kinderen.map((child: Partial<Person>) => ({
            ...child,
            fullName:
              child.naam?.volledigeNaam ??
              `${child.naam?.voornamen} ${child.naam?.voorvoegsel ?? ''}${child.naam?.voorvoegsel ? ' ' : ''}${child.naam?.geslachtsnaam}`,
            dateOfBirth: child.geboorte?.datum.datum ?? '-',
          }))
    ),
    tap(() => this.loading$.next(false))
  );
  constructor(
    private readonly route: ActivatedRoute,
    private readonly personApiService: PersonApiService
  ) {}
}
