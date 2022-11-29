/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
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

import {Injectable} from '@angular/core';
import {ConfigService, MenuConfig, MenuIncludeService, MenuItem} from '@valtimo/config';
import {NGXLogger} from 'ngx-logger';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {DocumentService} from '@valtimo/document';
import {UserProviderService} from '@valtimo/security';
import {filter, map} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  public includeFunctionObservables: {[key: string]: Observable<boolean>} = {};

  private _menuItems$ = new BehaviorSubject<MenuItem[]>(undefined);
  private menuConfig: MenuConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly documentService: DocumentService,
    private readonly userProviderService: UserProviderService,
    private readonly logger: NGXLogger,
    private readonly menuIncludeService: MenuIncludeService,
    private readonly router: Router
  ) {
    this.menuConfig = configService.config.menu;
  }

  init(): void {
    this.reload();
    this.logger.debug('Menu initialized');
  }

  private readonly currentRoute$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => (event as NavigationEnd)?.url)
  );

  // Find out which menu item sequence number matches the current url the closest
  public get closestSequence$(): Observable<string> {
    return combineLatest([this.currentRoute$, this.menuItems$]).pipe(
      map(([currentRoute, menuItems]) => {
        let closestSequence = '0';
        let highestDifference = 0;

        // recursive function to check how closely each item matches to the current url
        const checkItemMatch = (stringUrl: string, sequence: string): void => {
          // length of the current full url
          const currentRouteUrlLength = currentRoute.length;
          // length of the current full url with the item's url substracted
          const currentRouteSubstractLength = currentRoute.replace(stringUrl, '').length;
          // the amount of characters that could be substracted
          const difference = currentRouteUrlLength - currentRouteSubstractLength;

          // the larger the amount of characters that could be substracted, the more closely the menu item url matches the current url
          if (difference > highestDifference) {
            highestDifference = difference;
            closestSequence = sequence;
          }
        };

        // check how closely each menu item (and child menu item) matches the current url using a recursive function
        menuItems.forEach(item => {
          checkItemMatch(item.link?.join('') || '', `${item.sequence}`);

          if (item.children) {
            item.children.forEach(childItem => {
              if (Array.isArray(childItem.link)) {
                checkItemMatch(
                  Array.isArray(item.link)
                    ? [...item.link, ...childItem.link].join('')
                    : childItem.link.join(''),
                  `${item.sequence}${childItem.sequence}`
                );
              }
            });
          }
        });

        // returns the closest sequence number (each menu item has a sequence number)
        return closestSequence;
      })
    );
  }

  public get menuItems$(): Observable<MenuItem[]> {
    return this._menuItems$.asObservable();
  }

  public reload(): void {
    return this._menuItems$.next(this.loadMenuItems());
  }

  private loadMenuItems(): MenuItem[] {
    let menuItems: MenuItem[] = [];
    this.menuConfig.menuItems.forEach((menuItem: MenuItem) => {
      if (menuItem.includeFunction !== undefined) {
        this.includeFunctionObservables[menuItem.title] =
          this.menuIncludeService.getIncludeFunction(menuItem.includeFunction);
      }

      menuItem.show = true;
      menuItems.push(menuItem);
    });
    menuItems = this.sortMenuItems(menuItems);
    this.appendDossierSubMenuItems(menuItems).subscribe(
      value => (menuItems = this.applyMenuRoleSecurity(value))
    );
    return menuItems;
  }

  private sortMenuItems(menuItems: MenuItem[]): MenuItem[] {
    return menuItems.sort((a, b) => a.sequence - b.sequence);
  }

  private appendDossierSubMenuItems(menuItems: MenuItem[]): Observable<MenuItem[]> {
    return new Observable(subscriber => {
      this.logger.debug('appendDossierSubMenuItems');
      this.documentService.getAllDefinitions().subscribe(definitions => {
        const dossierMenuItems: MenuItem[] = definitions.content.map(
          (definition, index) =>
            ({
              link: ['/dossiers/' + definition.id.name],
              title: definition.schema.title,
              iconClass: 'icon mdi mdi-dot-circle',
              sequence: index,
              show: true,
            } as MenuItem)
        );
        this.logger.debug('found dossierMenuItems', dossierMenuItems);
        const menuItemIndex = menuItems.findIndex(({title}) => title === 'Dossiers');
        if (menuItemIndex > 0) {
          const dossierMenu = menuItems[menuItemIndex];
          this.logger.debug('updating dossierMenu', dossierMenu);
          dossierMenu.children = dossierMenuItems;
          menuItems[menuItemIndex] = dossierMenu;
        }
        subscriber.next(menuItems);
        this.logger.debug('appendDossierSubMenuItems finished');
      });
    });
  }

  private applyMenuRoleSecurity(menuItems: MenuItem[]): MenuItem[] {
    this.userProviderService.getUserSubject().subscribe(user => {
      if (user.roles != null) {
        this.logger.debug('applyMenuRoleSecurity');
        const userRoles = user.roles;
        menuItems.forEach((menuItem: MenuItem) => {
          const access = this.determineRoleAccess(menuItem, userRoles);
          this.logger.debug('Menu: check role access', menuItem.roles, access);
          if (menuItem.show !== access) {
            this.logger.debug('Menu: Change access', menuItem, access);
            menuItem.show = access;
          }
        });
      }
    });
    return menuItems;
  }

  private determineRoleAccess(menuItem: MenuItem, roles: string[]): boolean {
    if (!menuItem.roles) {
      return true;
    } else if (menuItem.roles.some(role => roles.includes(role))) {
      return true;
    } else {
      return false;
    }
  }
}
