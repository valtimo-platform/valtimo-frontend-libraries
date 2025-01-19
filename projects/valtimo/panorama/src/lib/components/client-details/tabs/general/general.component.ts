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
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {BehaviorSubject, Observable, switchMap, tap} from 'rxjs';
import {Person} from '../../../../models';
import {PersonApiService} from '../../../../services';
import {PersonCardComponent} from '../../person-card/person-card.component';
import {LoadingModule} from 'carbon-components-angular';

@Component({
  selector: 'valtimo-panorama-general-tab',
  templateUrl: './general.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, PersonCardComponent, LoadingModule],
})
export class GeneralTabComponent {
  public readonly person$: Observable<Person | null> = this.route.paramMap.pipe(
    switchMap((params: ParamMap) => this.personApiService.getPersonDetails(params.get('bsn'))),
    tap(() => {})
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly personApiService: PersonApiService
  ) {}
}
