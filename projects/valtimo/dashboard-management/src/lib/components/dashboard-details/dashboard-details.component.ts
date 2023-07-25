import {AfterViewInit, Component, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {
  CarbonTableConfig,
  ColumnType,
  createCarbonTableConfig,
  PageTitleService,
} from '@valtimo/components';
import {BehaviorSubject, combineLatest, map, Observable, switchMap, tap} from 'rxjs';
import {DashboardItem, WidgetModalType} from '../../models';
import {DashboardManagementService} from '../../services/dashboard-management.service';

@Component({
  templateUrl: './dashboard-details.component.html',
  styleUrls: ['./dashboard-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardDetailsComponent implements AfterViewInit {
  @ViewChild('moveButtonsTemplate', {static: false}) moveButtonsTemplate: TemplateRef<any>;

  public modalType: WidgetModalType = 'create';
  public tableConfig!: CarbonTableConfig;

  private readonly dashboardKey$ = this.route.params.pipe(map(params => params.id));
  public readonly currentDashboard$: Observable<DashboardItem | undefined> = combineLatest([
    this.dashboardKey$,
    this.translateService.stream('key'),
  ]).pipe(
    switchMap(([dashboardKey]) => this.dashboardManagementService.getDashboard(dashboardKey)),
    tap(currentDashboard => {
      if (!currentDashboard) {
        return;
      }

      console.log('dash', currentDashboard);

      this.pageTitleService.setCustomPageTitle(currentDashboard.name);
      this.pageTitleService.setCustomPageSubtitle(
        this.translateService.instant('dashboardManagement.widgets.metadata', {
          createdBy: currentDashboard.createdBy,
          createdOn: currentDashboard.createdOn,
          key: currentDashboard.key,
        })
      );
    })
  );

  public readonly widgetData$ = this.dashboardKey$.pipe(
    switchMap(dashboardKey =>
      this.dashboardManagementService.getDashboardWidgetConfiguration(dashboardKey)
    )
  );

  public readonly showModal$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService,
    private readonly translateService: TranslateService,
    private readonly dashboardManagementService: DashboardManagementService
  ) {}

  public ngAfterViewInit(): void {
    this.setTableConfig();
  }

  public addWidget(): void {
    this.modalType = 'create';
    this.showModal();
  }

  public editDashboard(): void {
    this.modalType = 'editDashboard';
    this.showModal();
  }

  private setTableConfig(): void {
    this.tableConfig = createCarbonTableConfig({
      fields: [
        {
          columnType: ColumnType.TEXT,
          fieldName: 'name',
          translationKey: 'Name',
        },
        {
          columnType: ColumnType.TEMPLATE,
          template: this.moveButtonsTemplate,
          className: 'dashboard-detail-table__actions',
          fieldName: '',
          translationKey: '',
        },
        {
          columnType: ColumnType.ACTION,
          className: 'dashboard-detail-table__actions',
          fieldName: '',
          translationKey: '',
          actions: [
            {
              actionName: 'Edit',
              callback: this.editWidget.bind(this),
            },
            {
              actionName: 'Delete',
              callback: this.deleteWidget.bind(this),
              type: 'danger',
            },
          ],
        },
      ],
      searchable: true,
      showSelectionColumn: false,
    });
  }

  private editWidget(): void {
    this.modalType = 'edit';
    this.showModal();
  }

  private deleteWidget(): void {
    this.modalType = 'delete';
    this.showModal();
  }

  private showModal(): void {
    this.showModal$.next(true);
  }
}
