import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ValtimoModalService {
  private readonly _scrollToTop$ = new Subject<null>();

  constructor() {}

  get scrollToTop$(): Observable<any> {
    return this._scrollToTop$.asObservable();
  }

  scrollToTop(): void {
    this._scrollToTop$.next(null);
  }
}
