import {Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, Subscription} from 'rxjs';
import {DashboardItem, WidgetModalType} from '../../models';
import {FormBuilder, Validators} from '@angular/forms';
import {ListItem, NotificationService} from 'carbon-components-angular';
import {TranslateService} from '@ngx-translate/core';
import {DOCUMENT} from '@angular/common';
import {DashboardManagementService} from '../../services/dashboard-management.service';
import {CARBON_CONSTANTS} from '@valtimo/components';

@Component({
  selector: 'valtimo-widget-modal',
  templateUrl: './widget-modal.component.html',
  styleUrls: ['./widget-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [NotificationService],
})
export class WidgetModalComponent implements OnInit, OnDestroy {
  @Input() public showModal$: Observable<boolean>;
  @Input() public type: WidgetModalType;
  @Input() public dashboard: DashboardItem;

  public form = this.fb.group({
    title: this.fb.control('', [Validators.required]),
    dataSource: this.fb.control('', [Validators.required]),
  });

  public readonly open$ = new BehaviorSubject<boolean>(false);

  private readonly _selectedDataSourceKey$ = new BehaviorSubject<string>('');

  public readonly dataSourceItems$: Observable<Array<ListItem>> = combineLatest([
    this.dashboardManagementService.getDataSources(),
    this._selectedDataSourceKey$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([dataSources, selectedDataSourceKey]) =>
      dataSources.map(dataSource => ({
        content: dataSource.title,
        selected: selectedDataSourceKey === dataSource.key,
        key: dataSource.key,
      }))
    )
  );

  private _openSubscription!: Subscription;

  public get title() {
    return this.form.get('title');
  }
  public get key() {
    return this.form.get('key');
  }
  public get dataSource() {
    return this.form.get('dataSource');
  }

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly fb: FormBuilder,
    private readonly translateService: TranslateService,
    private readonly notificationService: NotificationService,
    private readonly dashboardManagementService: DashboardManagementService
  ) {}

  public ngOnInit(): void {
    this.openOpenSubscription();
  }

  public ngOnDestroy(): void {
    this._openSubscription?.unsubscribe();
  }

  public closeModal(): void {
    this.open$.next(false);

    setTimeout(() => {
      this.form.reset();
      this._selectedDataSourceKey$.next('');
    }, CARBON_CONSTANTS.modalAnimationMs);
  }

  public save(): void {}

  public delete(): void {}

  public saveDashboard(): void {}

  public dataSourceSelected(dataSource: ListItem): void {
    if (!this.dataSource) {
      return;
    }

    this._selectedDataSourceKey$.next(dataSource?.item?.key);
    this.dataSource.setValue(dataSource?.item?.key);
  }

  private openOpenSubscription(): void {
    this._openSubscription = this.showModal$.subscribe(show => {
      this.open$.next(show);
    });
  }
}
