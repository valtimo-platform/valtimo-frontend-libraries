import {
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, Subscription} from 'rxjs';
import {DashboardItem, WidgetModalType} from '../../models';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
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
export class WidgetModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public showModal$: Observable<boolean>;
  @Input() public type: WidgetModalType;
  @Input() public dashboard: DashboardItem;

  public form = this.fb.group({
    title: this.fb.control(''),
    dataSource: this.fb.control('', [Validators.required]),
  });

  public editDashboardForm!: FormGroup;

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

  public readonly roleItems$ = new BehaviorSubject<Array<ListItem>>([
    {content: 'ROLE_ADMIN', selected: false},
    {content: 'ROLE_USER', selected: false},
    {content: 'ROLE_DEVELOPER', selected: false},
  ]);
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
  public get chartType() {
    return this.form.get('chartType');
  }

  public get dataSourceField() {
    return this.form.get('dataSourceField');
  }

  public get dashboardTitle() {
    return this.editDashboardForm.get('title');
  }

  public get dashboardDescription() {
    return this.editDashboardForm.get('description');
  }

  public get dashboardRoles() {
    return this.editDashboardForm.get('roles');
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
    this.setEditDashboardForm();
  }

  public ngOnChanges(): void {
    this.setEditDashboardForm();
  }

  public ngOnDestroy(): void {
    this._openSubscription?.unsubscribe();
  }

  public closeModal(): void {
    this.open$.next(false);
    this.form.reset();
    this.editDashboardForm.reset();
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

  private setEditDashboardForm(): void {
    this.editDashboardForm = this.fb.group({
      title: this.fb.control('', [Validators.required]),
      description: this.fb.control('', [Validators.required]),
      roles: this.fb.control([], [Validators.required]),
    });

    this.dashboardTitle?.setValue(this.dashboard.title);
    this.dashboardDescription?.setValue(this.dashboard.description);
    this.dashboardRoles?.setValue(this.dashboard.roles);
  }

  private openOpenSubscription(): void {
    this._openSubscription = this.showModal$.subscribe(show => {
      this.open$.next(show);
    });
  }
}
