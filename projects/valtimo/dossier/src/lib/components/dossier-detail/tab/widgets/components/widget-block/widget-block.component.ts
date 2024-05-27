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

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaseWidgetWithUuid, CaseWidgetXY} from '../../../../../../models';
import {BehaviorSubject, combineLatest, filter, map, Observable, Subscription, take} from 'rxjs';
import {DossierWidgetsLayoutService} from '../../../../../../services';

@Component({
  selector: 'valtimo-dossier-widget-block',
  templateUrl: './widget-block.component.html',
  styleUrls: ['./widget-block.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class WidgetBlockComponent implements AfterViewInit, OnDestroy {
  @ViewChild('widgetBlockContent') private _widgetBlockContentRef: ElementRef<HTMLDivElement>;
  @ViewChild('widgetBlock') private _widgetBlockRef: ElementRef<HTMLDivElement>;

  private readonly _widget$ = new BehaviorSubject<CaseWidgetWithUuid | null>(null);

  public get widget$(): Observable<CaseWidgetWithUuid> {
    return this._widget$.pipe(filter(widget => widget !== null));
  }

  // to remove
  public get stringifiedWidget$(): Observable<string> {
    return this._widget$.pipe(map(widget => JSON.stringify(widget)));
  }

  public readonly caseWidgetXY$: Observable<CaseWidgetXY> = combineLatest([
    this.dossierWidgetsLayoutService.packResult$,
    this.widget$,
  ]).pipe(
    map(([packResult, widget]) => {
      const widgetPackResult = packResult.items.find(
        packItem => packItem.item.configurationKey === widget.uuid
      );

      return widgetPackResult ? {x: widgetPackResult.x, y: widgetPackResult.y} : {x: 0, y: 0};
    })
  );

  @Input() public set widget(value: CaseWidgetWithUuid) {
    this._widget$.next(value);
  }

  private readonly _caseWidgetWidthsPx$ = this.dossierWidgetsLayoutService.caseWidgetWidthsPx$;

  private readonly _subscriptions = new Subscription();

  private _setToVisible = false;
  private _observer!: ResizeObserver;

  constructor(
    private readonly dossierWidgetsLayoutService: DossierWidgetsLayoutService,
    private readonly renderer: Renderer2
  ) {}

  public ngAfterViewInit(): void {
    this.openWidgetWidthSubscription();
    this.openContentHeightObserver();
    this.openWidgetHeightSubscription();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
    this._observer?.disconnect();
  }

  private openWidgetWidthSubscription(): void {
    this._subscriptions.add(
      combineLatest([this._caseWidgetWidthsPx$, this.widget$]).subscribe(
        ([caseWidgetsWidths, widget]) => {
          const widgetWidth = caseWidgetsWidths[widget.uuid];

          if (widgetWidth) {
            if (!this._setToVisible) {
              this.renderer.setStyle(this._widgetBlockRef.nativeElement, 'visibility', 'visible');
            }
            this.renderer.setStyle(this._widgetBlockRef.nativeElement, 'width', `${widgetWidth}px`);
            this._setToVisible = true;
          }
        }
      )
    );
  }

  private openWidgetHeightSubscription(): void {
    this._subscriptions.add(
      combineLatest([
        this.dossierWidgetsLayoutService.widgetsContentHeightsRounded$,
        this.widget$,
      ]).subscribe(([caseWidgetContentHeights, widget]) => {
        const widgetHeight = caseWidgetContentHeights[widget.uuid];

        if (widgetHeight) {
          this.renderer.setStyle(this._widgetBlockRef.nativeElement, 'height', `${widgetHeight}px`);
        }
      })
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
      this.widget$.pipe(take(1)).subscribe(widget => {
        this.dossierWidgetsLayoutService.setWidgetContentHeight(widget.uuid, widgetContentHeight);
      });
    }
  }
}
