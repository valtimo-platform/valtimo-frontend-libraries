import {Injectable} from '@angular/core';
import {BehaviorSubject, filter, Observable} from 'rxjs';
import {DossierTabService} from './dossier-tab.service';
import {ProcessInstanceTask} from '@valtimo/process';

@Injectable()
export class DossierDetailLayoutService {
  private readonly _tabContentContainerWidth$ = new BehaviorSubject<number | null>(null);
  private readonly _showTaskList$ = this.dossierTabService.showTaskList$;
  private readonly _taskToOpen$ = new BehaviorSubject<ProcessInstanceTask | null>(null);

  public get tabContentContainerWidth$(): Observable<number> {
    return this._tabContentContainerWidth$.pipe(filter(width => typeof width === 'number'));
  }

  public get taskToOpen$(): Observable<ProcessInstanceTask | null> {
    return this._taskToOpen$.asObservable();
  }

  constructor(private readonly dossierTabService: DossierTabService) {}

  public setTabContentContainerWidth(width: number): void {
    this._tabContentContainerWidth$.next(width);
  }

  public setTaskToOpen(value: ProcessInstanceTask | null): void {
    this._taskToOpen$.next(value);
  }
}
