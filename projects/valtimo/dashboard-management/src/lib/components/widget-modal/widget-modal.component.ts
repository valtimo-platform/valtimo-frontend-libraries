import {Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BehaviorSubject, combineLatest, map, Observable, Subscription, take, tap} from 'rxjs';
import {DashboardItem, WidgetDataSource, WidgetModalType} from '../../models';
import {FormBuilder, Validators} from '@angular/forms';
import {ListItem, NotificationService} from 'carbon-components-angular';
import {TranslateService} from '@ngx-translate/core';
import {DOCUMENT} from '@angular/common';
import {DashboardManagementService} from '../../services/dashboard-management.service';
import {CARBON_CONSTANTS} from '@valtimo/components';
import {DisplayTypeSpecification, WidgetService} from '@valtimo/dashboard';

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
    displayType: this.fb.control('', [Validators.required]),
  });

  public readonly open$ = new BehaviorSubject<boolean>(false);

  private readonly _selectedDataSourceKey$ = new BehaviorSubject<string>('');

  public readonly dataSourceItems$: Observable<Array<ListItem>> = combineLatest([
    this.dashboardManagementService.getDataSources(),
    this._selectedDataSourceKey$,
    this.translateService.stream('key'),
  ]).pipe(
    tap(([dataSources, selectedDataSourceKey]) => {
      if (selectedDataSourceKey) {
        this.setCompatibleDisplayTypes(dataSources, selectedDataSourceKey);
      } else {
        this.resetCompatibleDisplayTypes();
      }
    }),
    map(([dataSources, selectedDataSourceKey]) =>
      dataSources.map(dataSource => ({
        content: dataSource.title,
        selected: selectedDataSourceKey === dataSource.key,
        key: dataSource.key,
      }))
    )
  );

  private readonly _selectedDisplayTypeKey$ = new BehaviorSubject<string>('');

  private readonly _compatibleDisplayTypes$ = new BehaviorSubject<Array<DisplayTypeSpecification>>(
    []
  );

  public readonly displayTypeItems$: Observable<Array<ListItem>> = combineLatest([
    this._compatibleDisplayTypes$,
    this._selectedDisplayTypeKey$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([compatibleDisplayTypes, selectedDisplayTypeKey]) =>
      compatibleDisplayTypes.map(displayType => ({
        content: displayType.displayTypeKey,
        selected: displayType.displayTypeKey === selectedDisplayTypeKey,
        key: displayType.displayTypeKey,
      }))
    )
  );

  public readonly displayTypeDropdownDisabled$: Observable<boolean> = combineLatest([
    this._compatibleDisplayTypes$,
    this._selectedDataSourceKey$,
  ]).pipe(
    map(
      ([compatibleDisplayTypes, selectedDataSourceKey]) =>
        compatibleDisplayTypes?.length === 0 || !selectedDataSourceKey
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

  public get displayType() {
    return this.form.get('displayType');
  }

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly fb: FormBuilder,
    private readonly translateService: TranslateService,
    private readonly notificationService: NotificationService,
    private readonly dashboardManagementService: DashboardManagementService,
    private readonly widgetService: WidgetService
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
      this._selectedDisplayTypeKey$.next('');
    }, CARBON_CONSTANTS.modalAnimationMs);
  }

  public save(): void {}

  public delete(): void {}

  public dataSourceSelected(dataSource: ListItem): void {
    if (!dataSource) {
      return;
    }

    this._selectedDataSourceKey$.next(dataSource?.item?.key);
    this.dataSource.setValue(dataSource?.item?.key);
  }

  public displayTypeSelected(displayType: ListItem): void {
    if (!displayType) {
      return;
    }

    this._selectedDisplayTypeKey$.next(displayType?.item?.key);
    this.displayType.setValue(displayType?.item?.key);
  }

  private openOpenSubscription(): void {
    this._openSubscription = this.showModal$.subscribe(show => {
      this.open$.next(show);
    });
  }

  private resetCompatibleDisplayTypes(): void {
    this._compatibleDisplayTypes$.next([]);
  }

  private setCompatibleDisplayTypes(
    dataSources: Array<WidgetDataSource>,
    selectedDataSourceKey: string
  ): void {
    this.widgetService.supportedDisplayTypes$.pipe(take(1)).subscribe(supportedDisplayTypes => {
      const selectedDataSource = dataSources.find(source => source.key === selectedDataSourceKey);
      const availableDataFeatures = selectedDataSource?.dataFeatures;
      const compatibleDisplayTypes = supportedDisplayTypes.filter(displayType => {
        const supportedDataFeatures = displayType.requiredDataFeatures.filter(feature =>
          availableDataFeatures.includes(feature)
        );
        return supportedDataFeatures.length === displayType.requiredDataFeatures.length;
      });

      this._compatibleDisplayTypes$.next(compatibleDisplayTypes);
    });
  }
}
