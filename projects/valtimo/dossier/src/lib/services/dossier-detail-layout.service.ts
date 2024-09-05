import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, filter, map, Observable} from 'rxjs';
import {DossierTabService} from './dossier-tab.service';
import {ProcessInstanceTask} from '@valtimo/process';
import {DossierDetailLayout} from '../models';
import {FormDisplayType, FormSize} from '@valtimo/process-link';

@Injectable()
export class DossierDetailLayoutService {
  private readonly _tabContentContainerWidth$ = new BehaviorSubject<number | null>(null);
  private readonly _showTaskList$ = this.dossierTabService.showTaskList$;
  private readonly _taskToOpen$ = new BehaviorSubject<ProcessInstanceTask | null>(null);
  private readonly _formDisplayType$ = new BehaviorSubject<FormDisplayType | null>(null);
  private readonly _formDisplaySize$ = new BehaviorSubject<FormSize | null>(null);

  public get tabContentContainerWidth$(): Observable<number> {
    return this._tabContentContainerWidth$.pipe(filter(width => typeof width === 'number'));
  }

  public get taskToOpen$(): Observable<ProcessInstanceTask | null> {
    return this._taskToOpen$.asObservable();
  }

  public readonly dossierDetailLayout$: Observable<DossierDetailLayout> = combineLatest([
    this.tabContentContainerWidth$,
    this._showTaskList$,
    this._taskToOpen$,
    this._formDisplayType$,
    this._formDisplaySize$,
  ]).pipe(
    map(([showTaskList, taskToOpen, formDisplayType, formDisplaySize]) => {
      if (!showTaskList) {
        return {
          showRightPanel: false,
          leftPanelWidthPx: 
        }
      }
      return {} as DossierDetailLayout;
    })
  );

  constructor(private readonly dossierTabService: DossierTabService) {}

  public setTabContentContainerWidth(width: number): void {
    this._tabContentContainerWidth$.next(width);
  }

  public setTaskToOpen(value: ProcessInstanceTask | null): void {
    this._taskToOpen$.next(value);
  }

  public setFormDisplayType(type: FormDisplayType): void {
    this._formDisplayType$.next(type);
  }

  public setFormDisplaySize(size: FormSize): void {
    this._formDisplaySize$.next(size);
  }
}
