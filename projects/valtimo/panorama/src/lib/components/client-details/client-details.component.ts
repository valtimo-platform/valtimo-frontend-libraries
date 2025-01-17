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
import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {PageTitleService} from '@valtimo/components';
import {TabsModule} from 'carbon-components-angular';
import {tap} from 'rxjs';

import {Person} from '../../models';
import {PersonService} from '../../services/person.service';
import {FamilyTabComponent, GeneralTabComponent, OngoingCasesTabComponent} from './tabs';

@Component({
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TabsModule,
    GeneralTabComponent,
    FamilyTabComponent,
    OngoingCasesTabComponent,
  ],
})
export class ClientDetailsComponent implements OnDestroy {
  public readonly person$ = this.personService.person$.pipe(
    tap((person: Person | null) => {
      if (!!person) this.pageTitleService.setCustomPageTitle(person.naam.volledigeNaam, true);
    })
  );

  constructor(
    private readonly personService: PersonService,
    private readonly pageTitleService: PageTitleService
  ) {}

  public ngOnDestroy(): void {
    this.pageTitleService.enableReset();
  }
}
