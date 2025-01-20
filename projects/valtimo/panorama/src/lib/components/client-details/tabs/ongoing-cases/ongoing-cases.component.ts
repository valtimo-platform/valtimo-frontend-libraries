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
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {CarbonListModule, ColumnConfig, ViewType} from '@valtimo/components';
import {AccordionModule, ButtonModule, InputModule, LoadingModule} from 'carbon-components-angular';
import {BehaviorSubject, map, switchMap, tap} from 'rxjs';
import {LopendeZaak} from '../../../../models';
import {LopendeZaakApiService} from '../../../../services';

@Component({
  selector: 'valtimo-panorama-ongoing-cases-tab',
  templateUrl: './ongoing-cases.component.html',
  styleUrl: './ongoing-cases.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputModule,
    AccordionModule,
    LoadingModule,
    CarbonListModule,
    ButtonModule,
  ],
})
export class OngoingCasesTabComponent implements AfterViewInit {
  @HostBinding('class') public readonly class = 'valtimo-panorama-ongoing-cases-tab';
  @ViewChild('goToCaseTemplate') goToCaseTemplate: TemplateRef<any>;

  public readonly loading$ = new BehaviorSubject<boolean>(true);
  public readonly fields$ = new BehaviorSubject<ColumnConfig[]>([]);
  public readonly cases$ = this.route.paramMap.pipe(
    tap(() => this.loading$.next(true)),
    switchMap((params: ParamMap) => this.lopendeZaakApiService.getLopendeZaken(params.get('bsn'))),
    map((cases: {results: LopendeZaak[]}) => cases.results),
    tap(() => this.loading$.next(false))
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly lopendeZaakApiService: LopendeZaakApiService
  ) {}

  public ngAfterViewInit(): void {
    this.fields$.next([
      {
        key: 'identificatie',
        label: 'panorama.lopendeZaak.id',
        viewType: ViewType.TEXT,
      },
      {
        key: 'zaakTypeOmschrijving',
        label: 'panorama.lopendeZaak.description',
        viewType: ViewType.TEXT,
      },
      {
        key: 'startdatum',
        label: 'panorama.lopendeZaak.startDate',
        viewType: ViewType.DATE,
        format: 'DD/MM/YYYY',
      },
      {
        key: 'statusOmschrijving',
        label: 'panorama.lopendeZaak.statusDescription',
        viewType: ViewType.TEXT,
      },
      {
        key: '',
        label: '',
        viewType: ViewType.TEMPLATE,
        template: this.goToCaseTemplate,
      },
    ]);
  }

  public onGoToCaseClick(item: LopendeZaak): void {
    console.log({item});
  }
}
