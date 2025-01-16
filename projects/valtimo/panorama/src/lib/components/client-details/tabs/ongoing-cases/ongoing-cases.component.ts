import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, HostBinding, ViewEncapsulation} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {AccordionModule, InputModule} from 'carbon-components-angular';
import {LopendeZaakService} from '../../../../services';
import {Observable, map, tap} from 'rxjs';
import {LopendeStatus, LopendeZaak} from '../../../../models';
import {ViewContentService, ViewType} from '@valtimo/components';

@Component({
  selector: 'panorama-ongoing-cases-tab',
  templateUrl: './ongoing-cases.component.html',
  styleUrl: './ongoing-cases.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, TranslateModule, InputModule, AccordionModule],
})
export class OngoingCasesTabComponent {
  @HostBinding('class') public readonly class = 'panorama-ongoing-cases-tab';
  public readonly cases$: Observable<any[]> = this.lopendeZaakService.lopendeZaaken$.pipe(
    map((cases: LopendeZaak[]) =>
      cases.map((ongoingCase: LopendeZaak) => {
        return {
          ...ongoingCase,
          formattedDate: this.viewContentService.get(ongoingCase.startdatum, {
            viewType: ViewType.DATE,
            format: 'DD/MM/YYYY',
          }),
          statusGeschiedenis: ongoingCase.statusGeschiedenis.map((status: LopendeStatus) => ({
            ...status,
            formattedDateTime: this.viewContentService.get(status.datumStatusGezet, {
              viewType: ViewType.DATE_TIME,
              format: 'DD/MM/YYYY, hh:mm:ss',
            }),
          })),
        };
      })
    ),
    tap(res => {
      console.log({res});
    })
  );

  constructor(
    private readonly lopendeZaakService: LopendeZaakService,
    private readonly viewContentService: ViewContentService
  ) {}
}
