import {AfterViewInit, Component, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BehaviorSubject, map, Observable, tap} from 'rxjs';
import {DashboardItem, DashboardWidget, WidgetModalType} from '../../models';
import {dashboardListMock, widgetListMock} from '../../mocks';
import {
  CarbonTableConfig,
  ColumnType,
  createCarbonTableConfig,
  PageTitleService,
} from '@valtimo/components';

@Component({
  templateUrl: './dashboard-details.component.html',
  styleUrls: ['./dashboard-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardDetailsComponent implements AfterViewInit {
  @ViewChild('moveButtonsTemplate', {static: false}) moveButtonsTemplate: TemplateRef<any>;

  public modalType: WidgetModalType = 'create';
  public tableConfig!: CarbonTableConfig;
  public readonly currentDashbboard$: Observable<DashboardItem> = this.route.params.pipe(
    map(params => dashboardListMock.find(mockItem => mockItem.key === params.id)),
    tap(currentDashboard => {
      this.pageTitleService.setCustomPageTitle(currentDashboard.name);
    })
  );

  public readonly showModal$ = new BehaviorSubject<boolean>(false);
  private data: Array<DashboardWidget> = widgetListMock;
  public readonly widgetData$ = new BehaviorSubject<Array<DashboardWidget>>(this.data);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService
  ) {}

  ngAfterViewInit(): void {
    this.setTableConfig();
  }

  addWidget(): void {
    this.modalType = 'create';
    this.showModal();
  }

  private setTableConfig(): void {
    this.tableConfig = createCarbonTableConfig({
      fields: [
        {
          columnType: ColumnType.TEXT,
          fieldName: 'name',
          fieldLabel: 'Name',
        },
        {
          columnType: ColumnType.TEMPLATE,
          template: this.moveButtonsTemplate,
          fieldName: '',
          fieldLabel: '',
        },
        {
          columnType: ColumnType.ACTION,
          fieldName: '',
          fieldLabel: '',
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
