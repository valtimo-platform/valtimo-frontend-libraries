import {Injectable, Renderer2} from '@angular/core';
import {ProcessInstanceTask} from '@valtimo/process';
import {FormDisplayType, FormSize} from '@valtimo/process-link';
import {BehaviorSubject, combineLatest, filter, map, Observable, startWith} from 'rxjs';
import {DOSSIER_DETAIL_GUTTER_SIZE, DOSSIER_DETAIL_TASK_LIST_WIDTH} from '../constants';
import {DossierDetailLayout} from '../models';
import {DossierTabService} from './dossier-tab.service';

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

  public readonly dossierDetailLayout$: Observable<DossierDetailLayout | any> = combineLatest([
    this.tabContentContainerWidth$,
    this._showTaskList$,
    this._taskToOpen$,
    this._formDisplayType$,
    this._formDisplaySize$,
  ]).pipe(
    map(
      ([tabContentContainerWidth, showTaskList, taskToOpen, formDisplayType, formDisplaySize]) => {
        const availableWidth = tabContentContainerWidth - DOSSIER_DETAIL_GUTTER_SIZE;

        if (!showTaskList) {
          return {
            showRightPanel: false,
            widthAdjustable: false,
            unit: 'percent',
            leftPanelWidth: 100,
          };
        }

        if (!taskToOpen) {
          const leftPanelWidth =
            tabContentContainerWidth - DOSSIER_DETAIL_TASK_LIST_WIDTH - DOSSIER_DETAIL_GUTTER_SIZE;

          return {
            unit: 'pixel',
            showRightPanel: true,
            widthAdjustable: false,
            rightPanelMaxWidth: DOSSIER_DETAIL_TASK_LIST_WIDTH,
            rightPanelMinWidth: DOSSIER_DETAIL_TASK_LIST_WIDTH,
            rightPanelWidth: DOSSIER_DETAIL_TASK_LIST_WIDTH,
            leftPanelWidth: leftPanelWidth,
            leftPanelMaxWidth: leftPanelWidth,
            leftPanelMinWidth: leftPanelWidth,
          };
        }

        return {} as DossierDetailLayout;
      }
    ),
    startWith({})
  );

  private readonly _renderer!: Renderer2;

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
