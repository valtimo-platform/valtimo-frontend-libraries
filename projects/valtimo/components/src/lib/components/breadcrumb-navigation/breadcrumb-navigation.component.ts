/*
 * Copyright 2015-2023 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router} from '@angular/router';
import {filter, map} from 'rxjs/operators';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {ConfigService} from '@valtimo/config';
import {BreadcrumbItem} from 'carbon-components-angular';
import {MenuService} from '../menu/menu.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'valtimo-breadcrumb-navigation',
  templateUrl: './breadcrumb-navigation.component.html',
  styleUrls: ['./breadcrumb-navigation.component.css'],
})
export class BreadcrumbNavigationComponent implements OnInit, OnDestroy {
  public breadcrumbs: Array<any> = [];
  public readonly breadcrumbItems$: Observable<Array<BreadcrumbItem>> = combineLatest([
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

      console.log('router event', routerEvent);

      return [
        ...(activeParentSequenceNumber ? [activeParentBreadcrumbItem] : []),
        ...(secondBreadCrumb ? [secondBreadCrumb] : []),
      ];
    })
  );
  public appTitle = this.configService?.config?.applicationTitle || 'Valtimo';
  private routerSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private readonly configService: ConfigService,
    private readonly menuService: MenuService,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit() {
    this.setBreadcrumbs(this.route);
    this.openRouterSubscription();
  }

  ngOnDestroy() {
    this.routerSub.unsubscribe();
  }

  private getSecondBreadcrumb(routerEvent: NavigationEnd): BreadcrumbItem | false {
    const url = routerEvent.url;
    const splitUrl = url.split('/');
    const filteredSplitUrl = splitUrl.filter(urlPart => !!urlPart);

    console.log(filteredSplitUrl.slice(0, 2));

    if (filteredSplitUrl.length > 1) {
      return {
        route: [filteredSplitUrl.slice(0, 2)],
        content: filteredSplitUrl[1],
      };
    }

    return false;
  }

  private openRouterSubscription(): void {
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .pipe(map(() => this.route))
      .pipe(
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .pipe(filter(route => route.outlet === PRIMARY_OUTLET))
      .subscribe(route => {
        this.setBreadcrumbs(route);
      });
  }

  private setBreadcrumbs(route: ActivatedRoute) {
    while (route.firstChild) {
      route = route.firstChild;
    }
    if (route.outlet === PRIMARY_OUTLET) {
      const snapshot = route.snapshot;
      const activeRoute = {
        url: snapshot.url.join('/'),
        path: snapshot.routeConfig.path,
        label: snapshot.data['title'],
        params: snapshot.params,
      };
      this.generateBreadcrumbs(activeRoute);
    }
  }

  private generateBreadcrumbs(activeBreadcrumb: any) {
    this.breadcrumbs = [];
    this.router.config.map(routerConfig => {
      if (
        activeBreadcrumb.path.indexOf(routerConfig.path + '/') === 0 &&
        activeBreadcrumb.path !== routerConfig.path &&
        routerConfig.path !== ''
      ) {
        const parentRoute = {
          url: routerConfig.path.replace(/:(.+?)\b/g, (_, p1) => activeBreadcrumb.params[p1]),
          path: routerConfig.path,
          label: routerConfig.data['title'],
          params: activeBreadcrumb.params,
        };
        const exist = this.breadcrumbs.findIndex(item => item.url === parentRoute.url);
        if (exist === -1) {
          this.breadcrumbs.push(parentRoute);
        }
      }
    });
  }
}
