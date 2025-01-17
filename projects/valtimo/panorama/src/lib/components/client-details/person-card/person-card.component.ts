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
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Person} from '../../../models';
import {InputModule} from 'carbon-components-angular';
import {TranslateModule} from '@ngx-translate/core';
import {ViewContentService, ViewType} from '@valtimo/components';

@Component({
  selector: 'panorama-person-card',
  templateUrl: './person-card.component.html',
  styleUrl: './person-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, InputModule, TranslateModule],
})
export class PersonCardComponent {
  public readonly person$ = new BehaviorSubject<
    (Partial<Person> & {formattedAddress: string; formattedDateOfBirth: string}) | null
  >(null);
  @Input() public set person(value: Partial<Person> | null) {
    if (!value) return;

    this.person$.next({
      ...value,
      formattedDateOfBirth: this.viewContentService.get(value.geboorte?.datum.datum, {
        viewType: ViewType.DATE,
        format: 'DD/MM/YYYY',
      }),
      formattedAddress: `${value.verblijfplaats?.verblijfadres.officieleStraatnaam ?? '-'} ${value.verblijfplaats?.verblijfadres.huisnummer || ''}${value.verblijfplaats?.verblijfadres.huisletter || ''}
${value.verblijfplaats?.verblijfadres.postcode ?? '-'}
${value.verblijfplaats?.verblijfadres.woonplaats ?? '-'}
    `,
    });
  }

  @Input() public isFamilyCard = false;
  constructor(private readonly viewContentService: ViewContentService) {}
}
