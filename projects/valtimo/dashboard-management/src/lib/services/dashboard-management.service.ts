import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigService} from '@valtimo/config';
import {BehaviorSubject, catchError, Observable, of, switchMap, take, tap} from 'rxjs';
import {DashboardItem, DashboardWidget, WidgetDataSource} from '../models';

@Injectable({
  providedIn: 'root',
})
export class DashboardManagementService {
  private valtimoEndpointUri: string;

  public dashboards$ = new BehaviorSubject<{items: DashboardItem[] | null; loading: boolean}>({
    items: null,
    loading: true,
  });

  public loadData(): void {
    this.http
      .get<DashboardItem[]>(this.valtimoEndpointUri)
      .pipe(
        take(1),
        tap(() => {
          this.dashboards$.next({items: null, loading: true});
        })
      )
      .subscribe({
        next: (items: DashboardItem[]) => {
          this.dashboards$.next({items, loading: false});
        },
        error: error => {
          console.error(error);
        },
      });
  }

  constructor(private readonly http: HttpClient, private readonly configService: ConfigService) {
    this.valtimoEndpointUri = `${this.configService.config.valtimoApi.endpointUri}management/v1/dashboard`;
  }

  public createDashboard(dashboard: DashboardItem): Observable<DashboardItem> {
    return this.http.post<DashboardItem>(this.valtimoEndpointUri, dashboard);
  }

  public updateDashboards(dashboards: Array<DashboardItem>): Observable<Array<DashboardItem>> {
    return this.http.put<Array<DashboardItem>>(this.valtimoEndpointUri, dashboards);
  }

  public deleteDashboard(dashboardKey: string): Observable<null> {
    return this.http.delete<null>(`${this.valtimoEndpointUri}/${dashboardKey}`);
  }

  public dispatchAction(actionResult: Observable<DashboardItem | null>): void {
    actionResult
      .pipe(
        switchMap(() => this.getDashboards()),
        tap(() => {
          this.dashboards$.next({items: null, loading: true});
        }),
        take(1),
        catchError(error => of(error))
      )
      .subscribe({
        next: (items: DashboardItem[]) => this.dashboards$.next({items, loading: false}),
        error: error => {
          console.error(error);
        },
      });
  }

  public getDashboard(dashboardKey: string): Observable<DashboardItem> {
    return this.http.get<DashboardItem>(`${this.valtimoEndpointUri}/${dashboardKey}`);
  }

  public getDashboardWidgetConfiguration(dashboardKey: string): Observable<Array<DashboardWidget>> {
    return this.http.get<Array<DashboardWidget>>(
      `${this.valtimoEndpointUri}/${dashboardKey}/widget-configuration`
    );
  }

  public createDashboardWidgetConfiguration(
    dashboardKey: string,
    widgetConfiguration: DashboardWidget
  ): Observable<DashboardWidget> {
    return this.http.post<DashboardWidget>(
      `${this.valtimoEndpointUri}/${dashboardKey}/widget-configuration`,
      widgetConfiguration
    );
  }

  public getDataSources(): Observable<Array<WidgetDataSource>> {
    return this.http.get<Array<WidgetDataSource>>(`${this.valtimoEndpointUri}/widget-data-sources`);
  }

  private getDashboards(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(this.valtimoEndpointUri);
  }
}
