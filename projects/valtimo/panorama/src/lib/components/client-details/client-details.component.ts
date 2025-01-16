import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {PageTitleService} from '@valtimo/components';
import {startWith, tap} from 'rxjs';
import {person} from '../../mocks/person.mock';
import {Person} from '../../models';
import {PersonService} from '../../services/person.service';
import {FamilyTabComponent, GeneralTabComponent, OngoingCasesTabComponent} from './tabs';
import {TabsModule} from 'carbon-components-angular';
import {TranslateModule} from '@ngx-translate/core';

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
    }),
    startWith(person)
  );

  constructor(
    private readonly personService: PersonService,
    private readonly pageTitleService: PageTitleService
  ) {}

  public ngOnDestroy(): void {
    this.pageTitleService.enableReset();
  }
}
