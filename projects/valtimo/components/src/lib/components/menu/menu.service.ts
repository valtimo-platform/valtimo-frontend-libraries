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
import {BehaviorSubject, combineLatest, Observable, Subject, take, timer} from 'rxjs';
import {DocumentDefinitions, DocumentService} from '@valtimo/document';
import {UserProviderService} from '@valtimo/security';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  public includeFunctionObservables: {[key: string]: Observable<boolean>} = {};

  private _menuItems$ = new BehaviorSubject<MenuItem[]>(undefined);
  private menuConfig: MenuConfig;

  private readonly disableCaseCount!: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly documentService: DocumentService,
    private readonly userProviderService: UserProviderService,
    private readonly logger: NGXLogger,
    private readonly menuIncludeService: MenuIncludeService
  ) {
    const config = configService?.config;
    this.menuConfig = config?.menu;
    this.disableCaseCount = config?.featureToggles?.disableCaseCount;
  }

  init(): void {
    this.reload();
    this.logger.debug('Menu initialized');
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
        combineLatest([
          ...definitions.content.map(definition =>
            this.documentService.getCaseSettings(definition?.id?.name)
          ),
        ])
          .pipe(take(1))
          .subscribe(allCaseSettings => {
            const openDocumentCountMap =
              !this.disableCaseCount && this.getOpenDocumentCountMap(definitions);

            const dossierMenuItems: MenuItem[] = definitions.content.map((definition, index) => {
              const caseSettings = allCaseSettings?.find(
                setting => setting.name === definition.id.name
              );

              return {
                link: ['/dossiers/' + definition.id.name],
                title: definition.schema.title,
                iconClass: 'icon mdi mdi-dot-circle',
                sequence: index,
                show: true,
                ...(!this.disableCaseCount &&
                  caseSettings?.canHaveAssignee && {
                    count$: openDocumentCountMap.get(definition.id.name),
                  }),
              } as MenuItem;
            });
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
    });
  }

  private getOpenDocumentCountMap(definitions: DocumentDefinitions): Map<string, Subject<number>> {
    const countMap = new Map<string, Subject<number>>();
    definitions.content.forEach(definition =>
      countMap.set(definition.id.name, new Subject<number>())
    );

    timer(0, 5000).subscribe(() => {
      this.documentService.getOpenDocumentCount().subscribe(openDocumentCountList => {
        openDocumentCountList.forEach(openDocumentCount =>
          countMap
            .get(openDocumentCount.documentDefinitionName)
            .next(openDocumentCount.openDocumentCount)
        );
      });
    });
    return countMap;
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
    return !menuItem.roles || menuItem.roles.some(role => roles.includes(role));
  }
}
