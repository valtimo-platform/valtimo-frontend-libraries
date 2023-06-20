import {Injectable, OnDestroy, ViewContainerRef} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {NavigationEnd, NavigationStart, ResolveEnd, Router} from '@angular/router';
import {filter, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PageTitleService implements OnDestroy {
  private readonly _customPageTitle$ = new BehaviorSubject<string>('');
  private readonly _customPageTitleSet$ = new BehaviorSubject<boolean>(false);
  private readonly _customPageSubtitle$ = new BehaviorSubject<string>('');
  private readonly _customPageSubtitleSet$ = new BehaviorSubject<boolean>(false);
  private readonly _hasPageActions$ = new BehaviorSubject<boolean>(false);

  private readonly _pageActionsViewContainerRef$ = new BehaviorSubject<ViewContainerRef | null>(
    null
  );

  private _routeSubscription!: Subscription;

  private _preventReset!: boolean;

  get customPageTitle$(): Observable<string> {
    return this._customPageTitle$.asObservable();
  }

  get customPageTitleSet$(): Observable<boolean> {
    return this._customPageTitleSet$.asObservable();
  }

  get customPageSubtitle$(): Observable<string> {
    return this._customPageSubtitle$.asObservable();
  }

  get customPageSubtitleSet$(): Observable<boolean> {
    return this._customPageSubtitleSet$.asObservable();
  }

  get pageActionsViewContainerRef$(): Observable<ViewContainerRef> {
    return this._pageActionsViewContainerRef$.asObservable();
  }

  get hasPageActions$(): Observable<boolean> {
    return this._hasPageActions$.asObservable();
  }

  constructor(private readonly router: Router) {
    this.openRouteSubscription();
  }

  ngOnDestroy(): void {
    this._routeSubscription?.unsubscribe();
  }

  setCustomPageTitle(title: string, preventReset = false): void {
    this._customPageTitle$.next(title);
    this._customPageTitleSet$.next(true);

    if (preventReset) {
      this.disableReset();
    }
  }

  setCustomPageSubtitle(title: string): void {
    this._customPageSubtitle$.next(title);
    this._customPageSubtitleSet$.next(true);
  }

  disableReset(): void {
    this._preventReset = true;
  }

  enableReset(): void {
    this._preventReset = false;
  }

  setPageActionsViewContainerRef(ref: ViewContainerRef): void {
    this._pageActionsViewContainerRef$.next(ref);
  }

  setHasPageActions(value: boolean): void {
    this._hasPageActions$.next(value);
  }

  private openRouteSubscription(): void {
    this._routeSubscription = combineLatest([
      this.router.events,
      this._pageActionsViewContainerRef$,
    ])
      .pipe(
        filter(
          ([event]) =>
            event instanceof NavigationEnd ||
            event instanceof NavigationStart ||
            event instanceof ResolveEnd
        ),
        tap(([event, pageActionsViewContainerRef]) => {
          if (!this._preventReset) {
            this._customPageTitle$.next('');
            this._customPageTitleSet$.next(false);
            this._customPageSubtitle$.next('');
            this._customPageSubtitleSet$.next(false);

            if (pageActionsViewContainerRef) {
              pageActionsViewContainerRef.clear();
              this.setHasPageActions(false);
            }
          }
        })
      )
      .subscribe();
  }
}
