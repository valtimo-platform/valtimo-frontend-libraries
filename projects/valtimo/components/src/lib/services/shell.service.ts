import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShellService {
  private readonly _sideBarExpanded$ = new BehaviorSubject<boolean>(true);
  private readonly _largeScreen$ = new BehaviorSubject<boolean>(true);

  get sideBarExpanded$(): Observable<boolean> {
    return this._sideBarExpanded$.asObservable();
  }

  get largeScreen$(): Observable<boolean> {
    return this._largeScreen$.asObservable();
  }

  toggleSideBar(): void {
    const isExpanded = this._sideBarExpanded$.getValue();
    this._sideBarExpanded$.next(!isExpanded);
  }

  setLargeScreen(isLarge: boolean): void {
    this._largeScreen$.next(isLarge);
  }
}
