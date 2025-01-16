import {Injectable} from '@angular/core';
import {BehaviorSubject, filter} from 'rxjs';
import {LopendeZaak, Person} from '../models';
import {lopendeZaken} from '../mocks';

@Injectable({
  providedIn: 'root',
})
export class LopendeZaakService {
  private readonly _lopendeZaaken$ = new BehaviorSubject<LopendeZaak[]>(lopendeZaken.results);
  public readonly lopendeZaaken$ = this._lopendeZaaken$.pipe(
    filter((lopendeZaaken: LopendeZaak[]) => lopendeZaaken.length > 0)
  );

  public lopendeZakenOpen(zaken: LopendeZaak[]): void {
    this._lopendeZaaken$.next(zaken);
  }
}
