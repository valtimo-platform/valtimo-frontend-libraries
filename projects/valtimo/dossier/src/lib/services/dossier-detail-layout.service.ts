import {
  Inject,
  Injectable,
  OnDestroy,
  Renderer2,
  RendererFactory2,
  RendererStyleFlags2,
} from '@angular/core';
import {BehaviorSubject, combineLatest, filter, map, Observable} from 'rxjs';
import {DossierTabService} from './dossier-tab.service';
import {ProcessInstanceTask} from '@valtimo/process';
import {DossierDetailLayout} from '../models';
import {FormDisplayType, FormSize} from '@valtimo/process-link';
import {DOSSIER_DETAIL_GUTTER_SIZE} from '../constants';
import {DOCUMENT} from '@angular/common';

@Injectable()
export class DossierDetailLayoutService implements OnDestroy {
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
          return {
            showRightPanel: true,
            widthAdjustable: false,
          };
        }

        return {} as DossierDetailLayout;
      }
    )
  );

  private readonly _renderer!: Renderer2;

  constructor(
    private readonly dossierTabService: DossierTabService,
    public rendererFactory2: RendererFactory2,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this._renderer = rendererFactory2.createRenderer(null, null);
  }

  public ngOnDestroy(): void {
    this.removeDocumentStyle();
  }

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

  public setDocumentStyle(): void {
    this._renderer.setStyle(
      document.getElementsByTagName('html')[0],
      'overflow',
      'hidden',
      RendererStyleFlags2.Important
    );
  }

  private removeDocumentStyle(): void {
    this._renderer.removeStyle(document, 'overflow');
  }
}
