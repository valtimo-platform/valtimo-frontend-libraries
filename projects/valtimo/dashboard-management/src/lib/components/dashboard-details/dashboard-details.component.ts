import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map, Observable, tap} from 'rxjs';
import {DashboardItem} from '../../models';
import {dashboardListMock} from '../../mocks';
import {PageTitleService} from '@valtimo/components';

@Component({
  templateUrl: './dashboard-details.component.html',
  styleUrls: ['./dashboard-details.component.scss'],
})
export class DashboardDetailsComponent implements OnInit {
  public readonly currentDashbboard$: Observable<DashboardItem> = this.route.params.pipe(
    map(params => dashboardListMock.find(mockItem => mockItem.key === params.id)),
    tap(currentDashboard => {
      this.pageTitleService.setCustomPageTitle(currentDashboard.name);
    })
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService
  ) {}

  ngOnInit(): void {}
}
