import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BehaviorSubject, map, Observable, tap} from 'rxjs';
import {DashboardItem, DashboardWidget} from '../../models';
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
})
export class DashboardDetailsComponent implements OnInit {
  @ViewChild('moveUpTemplate', {read: TemplateRef}) moveUpTemplateRef: TemplateRef<any>;
  @ViewChild('moveDownTemplate', {read: TemplateRef}) moveDownTemplateRef: TemplateRef<any>;

  public readonly currentDashbboard$: Observable<DashboardItem> = this.route.params.pipe(
    map(params => dashboardListMock.find(mockItem => mockItem.key === params.id)),
    tap(currentDashboard => {
      this.pageTitleService.setCustomPageTitle(currentDashboard.name);
    })
  );

  public tableConfig!: CarbonTableConfig;

  private data: Array<DashboardWidget> = widgetListMock;

  public readonly widgetData$ = new BehaviorSubject<Array<DashboardWidget>>(this.data);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService
  ) {}

  ngOnInit(): void {
    this.setTableConfig();
  }

  addWidget(): void {}

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
          template: this.moveUpTemplateRef,
          fieldName: 'name',
          fieldLabel: 'Name',
        },
        {
          columnType: ColumnType.TEMPLATE,
          template: this.moveDownTemplateRef,
          fieldName: 'name',
          fieldLabel: 'Name',
        },
      ],
      searchable: true,
      showSelectionColumn: false,
    });
  }
}
