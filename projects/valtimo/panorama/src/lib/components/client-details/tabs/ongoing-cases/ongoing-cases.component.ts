import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, HostBinding, ViewEncapsulation} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {AccordionModule, InputModule} from 'carbon-components-angular';
import {LopendeZaakApiService} from '../../../../services';
import {Observable, map, switchMap, tap} from 'rxjs';
import {LopendeStatus, LopendeZaak} from '../../../../models';
import {ViewContentService, ViewType} from '@valtimo/components';
import {ActivatedRoute, ParamMap} from '@angular/router';

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

  public readonly cases$ = this.route.paramMap.pipe(
    switchMap((params: ParamMap) => this.lopendeZaakApiService.getLopendeZaken(params.get('bsn'))),
    map((cases: {results: LopendeZaak[]}) =>
      cases.results.map((ongoingCase: LopendeZaak) => {
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
    private readonly route: ActivatedRoute,
    private readonly lopendeZaakApiService: LopendeZaakApiService,
    private readonly viewContentService: ViewContentService
  ) {}
}
