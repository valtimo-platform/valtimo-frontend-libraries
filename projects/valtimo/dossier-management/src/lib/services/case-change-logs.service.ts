import {Injectable} from '@angular/core';
import {NamedUser} from '@valtimo/config';
import {of, map, Observable, BehaviorSubject, startWith, debounceTime} from 'rxjs';
import {COLLABORATORS} from '../mocks';
import {CaseChangeLog, Collaborator} from '../models';
import {CASE_CHANGE_LOGS} from '../mocks';

@Injectable({
  providedIn: 'root',
})
export class CaseChangeLogsService {
  private readonly _caseChangeLogs$ = new BehaviorSubject<CaseChangeLog[]>(CASE_CHANGE_LOGS);

  public readonly caseChangeLogs$: Observable<CaseChangeLog[] | null> = this._caseChangeLogs$.pipe(
    debounceTime(2000),
    startWith(null)
  );
}
