import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShellService {
  private renderer!: Renderer2;
  private readonly _sideBarExpanded$ = new BehaviorSubject<boolean>(true);
  private readonly _panelExpanded$ = new BehaviorSubject<boolean>(false);
  private readonly _largeScreen$ = new BehaviorSubject<boolean>(true);
  private readonly _mouseOnTopBar$ = new BehaviorSubject<boolean>(false);
  private readonly _sidenavWidth$ = new BehaviorSubject<number>(150);
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

  constructor(private readonly rendererFactory2: RendererFactory2) {
    this.renderer = rendererFactory2.createRenderer(null, null);
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
    this.renderer.setStyle(
      this._sidenavElement$.getValue(),
      'width',
      `${this._sidenavWidth$.getValue()}px`
    );
  }

  setContentElement(element: HTMLElement): void {
    this._contentElement$.next(element);
    this.renderer.setStyle(
      this._contentElement$.getValue(),
      'padding-left',
      `calc(2rem + ${this._sidenavWidth$.getValue()}px)`
    );
  }
}
