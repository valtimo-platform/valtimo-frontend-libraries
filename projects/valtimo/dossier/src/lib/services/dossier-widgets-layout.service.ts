import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, filter, map, Observable, take} from 'rxjs';
import {CaseWidgetContentHeightsPx, CaseWidgetWidthsPx, CaseWidgetWithUuid} from '../models';
import {WIDGET_HEIGHT_1X, WIDGET_WIDTH_1X} from '../constants';

@Injectable({
  providedIn: 'root',
})
export class DossierWidgetsLayoutService {
  private readonly _containerWidthSubject$ = new BehaviorSubject<number | null>(null);
  private readonly _widgetsSubject$ = new BehaviorSubject<CaseWidgetWithUuid[] | null>(null);
  private readonly _widgetsContentHeightsSubject$ = new BehaviorSubject<CaseWidgetContentHeightsPx>(
    {}
  );

  private get _containerWidth$(): Observable<number> {
    return this._containerWidthSubject$.pipe(filter(width => width !== null));
  }

  private get _width1x$(): Observable<number> {
    return this._containerWidth$.pipe(
      map(containerWidth => {
        const amountOf1XInContainer = Math.floor(containerWidth / WIDGET_WIDTH_1X);
        return Math.floor(containerWidth / amountOf1XInContainer);
      })
    );
  }

  private get _widgets$(): Observable<CaseWidgetWithUuid[]> {
    return this._widgetsSubject$.pipe(filter(widgets => widgets !== null));
  }

  private get _widgetsContentHeights$(): Observable<CaseWidgetContentHeightsPx> {
    return combineLatest([this._widgetsContentHeightsSubject$, this._widgets$]).pipe(
      filter(
        ([widgetsContentHeights, widgets]) =>
          Object.keys(widgetsContentHeights).length === widgets.length
      ),
      map(([widgetsContentHeights]) => widgetsContentHeights)
    );
  }

  public get widgetsContentHeightsRounded$(): Observable<CaseWidgetContentHeightsPx> {
    return this._widgetsContentHeights$.pipe(
      map(widgetsContentHeights =>
        Object.keys(widgetsContentHeights).reduce((acc, curr) => {
          return {
            ...acc,
            [curr]:
              Math.ceil((widgetsContentHeights[curr] + 16) / WIDGET_HEIGHT_1X) * WIDGET_HEIGHT_1X,
          };
        }, {})
      )
    );
  }

  public get caseWidgetWidthsPx$(): Observable<CaseWidgetWidthsPx> {
    return combineLatest([this._widgets$, this._width1x$, this._containerWidth$]).pipe(
      map(([widgets, width1x, containerWidth]) =>
        widgets.reduce((acc, curr) => {
          const widgetWidth = curr.width * width1x;

          return {...acc, [curr.uuid]: widgetWidth < containerWidth ? widgetWidth : containerWidth};
        }, {})
      )
    );
  }

  public setWidgets(widgets: CaseWidgetWithUuid[]): void {
    this._widgetsSubject$.next(widgets);
  }

  public setContainerWidth(width: number): void {
    this._containerWidthSubject$.next(width);
  }

  public setWidgetContentHeight(uuid: string, height: number): void {
    this._widgetsContentHeightsSubject$.pipe(take(1)).subscribe(widgetsContentHeights => {
      this._widgetsContentHeightsSubject$.next({...widgetsContentHeights, [uuid]: height});
    });
  }
}
