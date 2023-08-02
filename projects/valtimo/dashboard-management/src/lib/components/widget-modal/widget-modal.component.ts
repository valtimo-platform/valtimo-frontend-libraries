import {Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, Subscription} from 'rxjs';
import {DashboardItem, WidgetModalType} from '../../models';
import {FormBuilder, Validators} from '@angular/forms';
import {ListItem, NotificationService} from 'carbon-components-angular';
import {TranslateService} from '@ngx-translate/core';
import {DOCUMENT} from '@angular/common';
import {DashboardManagementService} from '../../services/dashboard-management.service';

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
    title: this.fb.control(''),
    dataSource: this.fb.control('', [Validators.required]),
  });
  public readonly open$ = new BehaviorSubject<boolean>(false);

  public readonly dataSourceItems$: Observable<Array<ListItem>> = combineLatest([
    this.dashboardManagementService.getDataSources(),
    this.translateService.stream('key'),
  ]).pipe(
    map(([dataSources]) =>
      dataSources.map(dataSource => ({
        content: dataSource.title,
        selected: false,
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
    this.form.reset();
  }

  public save(): void {}

  public delete(): void {}

  public saveDashboard(): void {}

  public dataSourceSelected(dataSource: any): void {
    if (!this.dataSource) {
      return;
    }

    this.dataSource.setValue(dataSource?.item?.content);
  }

  public copyKey(): void {
    if (!this.key || !this.document.defaultView) {
      return;
    }

    this.document.defaultView.navigator.clipboard.writeText(this.key.value);
    this.notificationService.showToast({
      caption: this.translateService.instant('dashboardManagement.widgets.form.keyCopied'),
      type: 'success',
      duration: 4000,
      showClose: true,
      title: this.translateService.instant('dashboardManagement.widgets.form.keyCopiedTitle'),
    });
  }

  private openOpenSubscription(): void {
    this._openSubscription = this.showModal$.subscribe(show => {
      this.open$.next(show);
    });
  }
}
