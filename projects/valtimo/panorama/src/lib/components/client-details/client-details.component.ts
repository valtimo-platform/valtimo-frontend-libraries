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
import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {PageTitleService} from '@valtimo/components';
import {TabsModule} from 'carbon-components-angular';
import {BehaviorSubject, Observable, switchMap, tap, Subscription} from 'rxjs';
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
  ],
})
export class ClientDetailsComponent implements OnInit, OnDestroy {
  public readonly activeTab$ = new BehaviorSubject<PanoramaTab>('general');
  private readonly _subscriptions = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly personApiService: PersonApiService,
    private readonly pageTitleService: PageTitleService
  ) {}

  public ngOnInit(): void {
    this._subscriptions.add(
      this.route.paramMap
        .pipe(
          switchMap((params: ParamMap) => this.personApiService.getPersonDetails(params.get('bsn')))
        )
        .subscribe(person => {
          if (!!person) this.pageTitleService.setCustomPageTitle(person.naam.volledigeNaam, true);
        })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
    this.pageTitleService.enableReset();
  }

  public onTabSelected(tab: PanoramaTab): void {
    this.activeTab$.next(tab);
  }
}
