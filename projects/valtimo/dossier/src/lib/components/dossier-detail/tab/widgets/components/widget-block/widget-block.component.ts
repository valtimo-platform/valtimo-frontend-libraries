/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {
  CARBON_THEME,
  CarbonListModule,
  CdsThemeService,
  CurrentCarbonTheme,
} from '@valtimo/components';
import {LoadingModule, TilesModule} from 'carbon-components-angular';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import {CaseWidgetPackResult, CaseWidgetType, CaseWidgetWithUuid} from '../../../../../../models';
import {
  DossierTabService,
  DossierWidgetsApiService,
  DossierWidgetsLayoutService,
} from '../../../../../../services';
import {WidgetCustomComponent} from '../custom/widget-custom.component';
import {WidgetFieldComponent} from '../field/widget-field.component';
import {WidgetTableComponent} from '../table/widget-table.component';

@Component({
  selector: 'valtimo-dossier-widget-block',
  templateUrl: './widget-block.component.html',
  styleUrls: ['./widget-block.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    LoadingModule,
    WidgetTableComponent,
    WidgetCustomComponent,
    CarbonListModule,
    TranslateModule,
    TilesModule,
    WidgetFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetBlockComponent implements AfterViewInit, OnDestroy {
  @ViewChild('widgetBlockContent') private _widgetBlockContentRef: ElementRef<HTMLDivElement>;
  @ViewChild('widgetBlock') private _widgetBlockRef: ElementRef<HTMLDivElement>;

  @Input() public set widget(value: CaseWidgetWithUuid) {
    this._widgetUuid = value.uuid;
    this._widget$.next(value);
  }

  private readonly _widget$ = new BehaviorSubject<CaseWidgetWithUuid | null>(null);

  public get widget$(): Observable<CaseWidgetWithUuid> {
    return this._widget$.pipe(filter(widget => widget !== null));
  }

  public readonly caseWidgetPackResult$: Observable<CaseWidgetPackResult> =
    this.dossierWidgetsLayoutService.packResult$.pipe(
      tap(packResult => {
        const widgetPackResult = packResult.items.find(
          packItem => packItem.item.configurationKey === this._widgetUuid
        );

        if (!widgetPackResult) return;

        this.renderer.setStyle(
          this._widgetBlockRef.nativeElement,
          'top',
          `${widgetPackResult.y}px`
        );

        this.renderer.setStyle(
          this._widgetBlockRef.nativeElement,
          'left',
          `${widgetPackResult.x}px`
        );

        this.dossierWidgetsLayoutService.setCaseWidgetXYSet(this._widgetUuid);
      })
    );

  private readonly _caseWidgetWidthsPx$ = this.dossierWidgetsLayoutService.caseWidgetWidthsPx$;
  private readonly _widthOverrides$ = this.dossierWidgetsLayoutService.widthOverrides$;

  public readonly CaseWidgetType = CaseWidgetType;

  public readonly documentId$ = this.route.params.pipe(
    map(params => params?.documentId),
    filter(documentId => !!documentId)
  );

  public readonly tabKey$: Observable<string> = this.dossierTabService.activeTabKey$;

  public readonly widgetData$ = combineLatest([this.widget$, this.tabKey$, this.documentId$]).pipe(
    switchMap(([widget, tabkey, documentId]) =>
      // custom component widgets do not fetch additional data
      widget.type === CaseWidgetType.CUSTOM
        ? of({})
        : this.widgetsApiService.getWidgetData(documentId, tabkey, widget.key)
    ),
    tap(() => {
      this.dossierWidgetsLayoutService.setCaseWidgetDataLoaded(this._widgetUuid);
    })
  );

  public readonly theme$ = combineLatest([this.cdsThemeService.currentTheme$, this.widget$]).pipe(
    map(([currentTheme, widgetConfiguration]) => {
      return currentTheme === CurrentCarbonTheme.G10
        ? widgetConfiguration.highContrast
          ? CARBON_THEME.G100
          : CARBON_THEME.G10
        : widgetConfiguration.highContrast
          ? CARBON_THEME.WHITE
          : CARBON_THEME.G90;
    })
  );

  private readonly _subscriptions = new Subscription();

  private _observer!: ResizeObserver;

  private _widgetUuid!: string;

  constructor(
    private readonly dossierWidgetsLayoutService: DossierWidgetsLayoutService,
    private readonly renderer: Renderer2,
    private readonly dossierTabService: DossierTabService,
    private readonly route: ActivatedRoute,
    private readonly widgetsApiService: DossierWidgetsApiService,
    private readonly cdsThemeService: CdsThemeService
  ) {}

  public ngAfterViewInit(): void {
    this.openWidgetWidthSubscription();
    this.openContentHeightObserver();
    this.openWidgetHeightSubscription();
    this.setInitialWidgetHeight();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
    this._observer?.disconnect();
  }

  private openWidgetWidthSubscription(): void {
    this._subscriptions.add(
      combineLatest([this._caseWidgetWidthsPx$, this._widthOverrides$]).subscribe(
        ([caseWidgetsWidths, widthOverrides]) => {
          const widgetWidth =
            widthOverrides[this._widgetUuid] || caseWidgetsWidths[this._widgetUuid];

          if (widgetWidth) {
            this.renderer.setStyle(this._widgetBlockRef.nativeElement, 'width', `${widgetWidth}px`);
          }
        }
      )
    );
  }

  private openWidgetHeightSubscription(): void {
    this._subscriptions.add(
      this.dossierWidgetsLayoutService.widgetsContentHeightsRounded$.subscribe(
        caseWidgetContentHeights => {
          const widgetHeight = caseWidgetContentHeights[this._widgetUuid];

          if (widgetHeight) {
            this.renderer.setStyle(
              this._widgetBlockRef.nativeElement,
              'height',
              `${widgetHeight}px`
            );
          }
        }
      )
    );
  }

  private openContentHeightObserver(): void {
    this._observer = new ResizeObserver(event => {
      this.observerMutation(event);
    });
    this._observer.observe(this._widgetBlockContentRef.nativeElement);
  }

  private observerMutation(event: Array<ResizeObserverEntry>): void {
    const widgetContentHeight = event[0]?.borderBoxSize[0]?.blockSize;

    if (typeof widgetContentHeight === 'number' && widgetContentHeight !== 0) {
      this.dossierWidgetsLayoutService.setWidgetContentHeight(
        this._widgetUuid,
        widgetContentHeight
      );
    }
  }

  private setInitialWidgetHeight(): void {
    this.dossierWidgetsLayoutService.setWidgetContentHeight(
      this._widgetUuid,
      this._widgetBlockContentRef.nativeElement.offsetHeight
    );
  }
}
