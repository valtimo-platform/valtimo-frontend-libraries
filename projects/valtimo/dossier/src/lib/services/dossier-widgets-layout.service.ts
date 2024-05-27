import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, filter, map, Observable} from 'rxjs';
import {CaseWidgetWidthsPx, CaseWidgetWithUuid} from '../models';
import {WIDGET_WIDTH_1X} from '../constants';

@Injectable({
  providedIn: 'root',
})
export class DossierWidgetsLayoutService {
  private readonly _containerWidthSubject$ = new BehaviorSubject<number | null>(null);
  private readonly _widgetsSubject$ = new BehaviorSubject<CaseWidgetWithUuid[] | null>(null);

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
}
