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
