import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShellService {
  private readonly _hamburgerActive$ = new BehaviorSubject<boolean>(true);

  get hamburgerActive$(): Observable<boolean> {
    return this._hamburgerActive$.asObservable();
  }

  toggleHamburger(): void {
    const active = this._hamburgerActive$.getValue();
    this._hamburgerActive$.next(!active);
  }
}
