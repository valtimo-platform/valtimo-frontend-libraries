import {Injectable} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {BreadcrumbItem} from 'carbon-components-angular';
import {filter, map} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {ConfigService} from '@valtimo/config';
import {MenuService} from '../menu/menu.service';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly _breadcrumbItems$: Observable<Array<BreadcrumbItem>> = combineLatest([
    this.router.events,
    this.menuService.activeParentSequenceNumber$,
    this.menuService.menuItems$,
    this.translateService.stream('key'),
  ]).pipe(
    filter(([routerEvent]) => routerEvent instanceof NavigationEnd),
    map(([routerEvent, activeParentSequenceNumber, menuItems]) => {
      const activeParentBreadcrumbTitle = menuItems.find(
        menuItem => `${menuItem.sequence}` === activeParentSequenceNumber
      )?.title;
      const activeParentBreadcrumbTitleTranslation =
        activeParentBreadcrumbTitle && this.translateService.instant(activeParentBreadcrumbTitle);
      const activeParentBreadcrumbItem = {
        content: activeParentBreadcrumbTitleTranslation,
      };
      const secondBreadCrumb = this.getSecondBreadcrumb(routerEvent as NavigationEnd);

      return [
        ...(activeParentSequenceNumber ? [activeParentBreadcrumbItem] : []),
        ...(secondBreadCrumb ? [secondBreadCrumb] : []),
      ];
    })
  );

  get breadcrumbItems$(): Observable<Array<BreadcrumbItem>> {
    return this._breadcrumbItems$;
  }

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly configService: ConfigService,
    private readonly menuService: MenuService,
    private readonly translateService: TranslateService
  ) {}

  private getSecondBreadcrumb(routerEvent: NavigationEnd): BreadcrumbItem | false {
    const url = routerEvent.url;
    const urlWithoutParams = url.includes('?') ? url.split('?')[0] : url;
    const splitUrl = urlWithoutParams.split('/');
    const filteredSplitUrl = splitUrl.filter(urlPart => !!urlPart);

    if (filteredSplitUrl.length > 1) {
      const route = filteredSplitUrl[0];
      const routeString = `/${route}`;
      const content = this.router.config.find(routeConfig => routeConfig.path === route)?.data
        ?.title;

      return {
        route: [routeString],
        content: this.translateService.instant(content),
      };
    }

    return false;
  }
}
