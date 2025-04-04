import {Component, HostBinding, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, delay, filter, map, Observable, of, switchMap, take, tap} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {CarbonListModule, InputModule} from '@valtimo/components';
import {TranslateModule} from '@ngx-translate/core';
import {LoadingModule, NotificationService} from 'carbon-components-angular';
import {WidgetsContainerComponent} from '../components/dossier-detail/tab/widgets/components/widgets-container/widgets-container.component';
import {
  DossierDetailLayoutService,
  DossierTabService,
  DossierWidgetsApiService,
  DossierWidgetsLayoutService,
} from '../services';
import {TabImpl, TabLoaderImpl} from '../models';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'iko-klant-page',
  templateUrl: 'iko-klant.page.html',
  styleUrl: 'iko-klant.page.scss',
  standalone: true,
  imports: [
    CommonModule,
    LoadingModule,
    WidgetsContainerComponent,
    CarbonListModule,
    TranslateModule,
    InputModule,
  ],
  providers: [DossierTabService, DossierDetailLayoutService, NotificationService],
})
export class IkoKlantPageComponent implements OnInit, OnDestroy {
  @HostBinding('class.tab--no-margin') private readonly _noMargin = true;
  @HostBinding('class.tab--no-background') private readonly _noBackground = true;
  @HostBinding('class.tab--no-min-height') private readonly _noMinHeight = true;

  private readonly _documentId$ =  this.route.params.pipe(
    map(params => params?.documentId),
    filter(documentId => !!documentId)
  );
  _bsn$ = new BehaviorSubject<String>(null);
  private readonly _tabKey$: Observable<string> = of('widgets');
  bsn: string = '999993653';

  public readonly loadingWidgetConfiguration$ = new BehaviorSubject<boolean>(true);

  public readonly widgetConfiguration$ = combineLatest([
    this._documentId$,
    this._tabKey$,
    this._bsn$,
  ]).pipe(
    switchMap(([documentId, tabKey]) => {
      return this.widgetsApiService.getWidgetTabConfiguration(documentId, tabKey);
    }),
    tap(() => this.loadingWidgetConfiguration$.next(false))
  );

  public loaded$ = of(true).pipe(delay(400));

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly dossierTabService: DossierTabService,
    private readonly widgetsApiService: DossierWidgetsApiService,
    private readonly dossierWidgetsLayoutService: DossierWidgetsLayoutService
  ) {
  }

  ngOnInit() {
    this.dossierTabService.setTabLoader(new TabLoaderMock());
  }

  public ngOnDestroy(): void {
    this.dossierWidgetsLayoutService.reset();
  }
}

class TabLoaderMock extends TabLoaderImpl {
  constructor() {
    super(null, null, null, null, null);
  }

  get activeTab$(): Observable<TabImpl> {
    return of(new TabImpl('widgets', 1, null));
  }
}
