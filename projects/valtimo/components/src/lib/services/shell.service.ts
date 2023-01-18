import {Injectable, OnDestroy, Renderer2, RendererFactory2} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShellService implements OnDestroy {
  private renderer!: Renderer2;
  private readonly _sideBarExpanded$ = new BehaviorSubject<boolean>(true);
  private readonly _panelExpanded$ = new BehaviorSubject<boolean>(false);
  private readonly _largeScreen$ = new BehaviorSubject<boolean>(true);
  private readonly _mouseOnTopBar$ = new BehaviorSubject<boolean>(false);
  private readonly _sidenavWidth$ = new BehaviorSubject<number>(500);
  private readonly _sidenavElement$ = new BehaviorSubject<HTMLElement>(undefined);
  private readonly _contentElement$ = new BehaviorSubject<HTMLElement>(undefined);

  get sideBarExpanded$(): Observable<boolean> {
    return this._sideBarExpanded$.asObservable();
  }
  get panelExpanded$(): Observable<boolean> {
    return this._panelExpanded$.asObservable();
  }
  get largeScreen$(): Observable<boolean> {
    return this._largeScreen$.asObservable();
  }
  get mouseOnTopBar$(): Observable<boolean> {
    return this._mouseOnTopBar$.asObservable();
  }

  get sidenavWidth$(): Observable<number> {
    return this._sidenavWidth$.asObservable();
  }

  private sidenavSizeSubscription!: Subscription;

  constructor(private readonly rendererFactory2: RendererFactory2) {
    this.renderer = rendererFactory2.createRenderer(null, null);
    this.openSidenavSizeSubscription();
  }

  ngOnDestroy(): void {
    this.sidenavSizeSubscription.unsubscribe();
  }

  toggleSideBar(): void {
    const isExpanded = this._sideBarExpanded$.getValue();
    this._sideBarExpanded$.next(!isExpanded);
  }

  togglePanel(): void {
    const isExpanded = this._panelExpanded$.getValue();
    this._panelExpanded$.next(!isExpanded);
  }

  setPanelExpanded(isExpanded: boolean): void {
    this._panelExpanded$.next(isExpanded);
  }

  setSideBarExpanded(isExpanded: boolean): void {
    this._sideBarExpanded$.next(isExpanded);
  }

  setLargeScreen(isLarge: boolean): void {
    this._largeScreen$.next(isLarge);
  }

  setMouseOnTopBar(mouseOnTopBar: boolean): void {
    this._mouseOnTopBar$.next(mouseOnTopBar);
  }

  setSidenavElement(element: HTMLElement): void {
    this._sidenavElement$.next(element);
  }

  setContentElement(element: HTMLElement): void {
    this._contentElement$.next(element);
  }

  private openSidenavSizeSubscription(): void {
    this.sidenavSizeSubscription = combineLatest([
      this._largeScreen$,
      this._sidenavWidth$,
      this._sidenavElement$,
      this._contentElement$,
    ]).subscribe(([largeScreen, sidenavWidth, sidenavElement, contentElement]) => {
      if (!largeScreen && sidenavElement && contentElement) {
        this.renderer.removeStyle(sidenavElement, 'min-width');
        this.renderer.removeStyle(contentElement, 'padding-left');
      } else if (
        largeScreen &&
        sidenavElement &&
        contentElement &&
        typeof sidenavWidth === 'number'
      ) {
        const pixelWidth = `${sidenavWidth}px`;
        this.renderer.setStyle(sidenavElement, 'min-width', `${pixelWidth}`);
        this.renderer.setStyle(contentElement, 'padding-left', `calc(2rem + ${pixelWidth})`);
      }
    });
  }
}
