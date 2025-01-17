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
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CarbonListItem, CarbonListModule, ColumnConfig, ViewType} from '@valtimo/components';
import {ButtonModule, IconModule, IconService, InputModule} from 'carbon-components-angular';
import {BehaviorSubject, map, Observable, of, startWith, switchMap} from 'rxjs';
import {Person} from '../../models';
import {LopendeZaakApiService, PersonApiService, PersonService} from '../../services';
import {Search16, TrashCan16} from '@carbon/icons';

@Component({
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputModule,
    ReactiveFormsModule,
    CarbonListModule,
    ButtonModule,
    IconModule,
  ],
})
export class ClientListComponent {
  @HostBinding('class') public readonly class = 'panorama-client-list';

  public readonly formGroup = this.fb.group({
    bsn: this.fb.control('', [Validators.required, Validators.pattern('[1-9][0-9]{8}')]),
  });

  public readonly fields$: Observable<ColumnConfig[]> = this.translateService.stream('key').pipe(
    map(() => [
      {
        key: 'burgerservicenummer',
        label: 'BSN',
        viewType: ViewType.TEXT,
      },
      {
        key: 'fullName',
        label: this.translateService.instant('panorama.columns.fullName'),
        viewType: ViewType.TEXT,
      },
      {
        key: 'dateOfBirth',
        label: this.translateService.instant('panorama.columns.dateOfBirth'),
        viewType: ViewType.DATE,
      },
    ])
  );

  private readonly _bsn$ = new BehaviorSubject<string | null>(null);
  public readonly items$: Observable<CarbonListItem[]> = this._bsn$.pipe(
    switchMap((bsn: string | null) => this.personApiService.getPersonDetails(bsn)),
    map((person: Person | null) =>
      !person
        ? []
        : [
            {
              ...person,
              fullName: person.naam.volledigeNaam,
              dateOfBirth: person.geboorte.datum.datum,
            },
          ]
    ),
    startWith([])
  );

  constructor(
    private readonly fb: FormBuilder,
    private readonly personApiService: PersonApiService,
    private readonly translateService: TranslateService,
    private readonly personService: PersonService,
    private readonly router: Router,
    private readonly iconService: IconService
  ) {
    this.iconService.registerAll([Search16, TrashCan16]);
  }

  public onRowClick(person: Person): void {
    this.personService.personDetailsOpen(person);
    this.router.navigate([`/panorama/${person.burgerservicenummer}`]);
  }

  public onSearchButtonClick(): void {
    this._bsn$.next(this.formGroup.get('bsn')?.value ?? null);
  }

  public onClearButtonClick(): void {
    this.formGroup.reset();
    this._bsn$.next(null);
  }
}
