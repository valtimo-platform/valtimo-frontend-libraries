import {Injectable} from '@angular/core';
import {BehaviorSubject, filter} from 'rxjs';
import {Person} from '../models';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private readonly _person$ = new BehaviorSubject<Person | null>(null);
  public readonly person$ = this._person$.pipe(filter((person: Person | null) => !!person));

  public personDetailsOpen(person: Person): void {
    this._person$.next(person);
  }
}
