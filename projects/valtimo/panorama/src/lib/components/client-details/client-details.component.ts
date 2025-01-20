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
import {ActivatedRoute, ParamMap} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {CarbonListModule, PageTitleService} from '@valtimo/components';
import {NotificationModule, NotificationService, TabsModule} from 'carbon-components-angular';
import {BehaviorSubject, of, switchMap, tap} from 'rxjs';
import {PanoramaTab, Person} from '../../models';
import {PersonApiService} from '../../services';
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
    CarbonListModule,
    NotificationModule,
  ],
  providers: [NotificationService],
})
export class ClientDetailsComponent implements OnDestroy {
  public readonly loading$ = new BehaviorSubject<boolean>(true);
  public readonly person$ = this.route.paramMap.pipe(
    tap(() => this.loading$.next(true)),
    switchMap((params: ParamMap) => {
      const bsn = params.get('bsn');
      if (bsn?.match('^[0-9]{9}')) return this.personApiService.getPersonDetails(bsn);

      return of(false);
    }),
    tap((person: Person | null | boolean) => {
      this.loading$.next(false);
      if (person === false) return;

      if (!!person && typeof person !== 'boolean')
        this.pageTitleService.setCustomPageTitle(person.naam.volledigeNaam, true);
    })
  );
  public readonly activeTab$ = new BehaviorSubject<PanoramaTab>('general');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly personApiService: PersonApiService,
    private readonly pageTitleService: PageTitleService
  ) {}

  public ngOnDestroy(): void {
    this.pageTitleService.enableReset();
  }

  public onTabSelected(tab: PanoramaTab): void {
    this.activeTab$.next(tab);
  }
}
