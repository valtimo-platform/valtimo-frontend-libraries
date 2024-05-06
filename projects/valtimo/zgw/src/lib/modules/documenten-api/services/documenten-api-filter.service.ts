import {Injectable} from '@angular/core';
import {SortState} from '@valtimo/components';
import {map, Observable, ReplaySubject, tap} from 'rxjs';
import {DocumentenApiFilterModel} from '../models';

@Injectable({
  providedIn: 'root',
})
export class DocumentenApiFilterService {
  private readonly _filter$ = new ReplaySubject<DocumentenApiFilterModel | null>(1);
  private readonly _sort$ = new ReplaySubject<{sort: string} | null>(1);

  public get filter$(): Observable<DocumentenApiFilterModel | null> {
    return this._filter$.asObservable();
  }

  public get sort$(): Observable<{sort: string} | null> {
    return this._sort$.asObservable();
  }

  public setFilter(filter: DocumentenApiFilterModel | null): void {
    this._filter$.next(!!filter && !Object.keys(filter).length ? null : filter);
  }

  public setSort(sortState: SortState | null): void {
    this._sort$.next(
      sortState && sortState.isSorting
        ? {sort: `${sortState.state.name},${sortState.state.direction}`}
        : null
    );
  }
}
