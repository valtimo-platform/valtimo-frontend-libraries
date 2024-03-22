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

import {
  AfterViewInit,
  Component,
  HostBinding,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {map, of, switchMap} from 'rxjs';
import {ConfigService} from '@valtimo/config';
import {IconService} from 'carbon-components-angular';
import User20 from '@carbon/icons/es/user/20';
import {ShellService} from '../../services/shell.service';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {PageHeaderService} from '../../services';

@Component({
  selector: 'valtimo-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, AfterViewInit {
  @HostBinding('class.cds--header') headerClass = true;

  @ViewChild('headerVcr', {static: true, read: ViewContainerRef})
  private readonly _headerVcr!: ViewContainerRef;

  public showUserNameInTopBar!: boolean;

  public logoBase64!: SafeResourceUrl;

  public readonly userFullName$ = of(this.keyCloakService.isLoggedIn()).pipe(
    switchMap(() => this.keyCloakService.loadUserProfile()),
    map(profile => `${profile.firstName} ${profile.lastName}`)
  );

  public readonly applicationTitle = this.configService.config.applicationTitle;
  public readonly largeLogoMargin = this.configService.config.featureToggles?.largeLogoMargin;
  public readonly sideBarExpanded$ = this.shellService.sideBarExpanded$;
  public readonly largeScreen$ = this.shellService.largeScreen$;
  public readonly panelExpanded$ = this.shellService.panelExpanded$;
  public readonly collapsibleWidescreenMenu$ = this.shellService.collapsibleWidescreenMenu$;
  constructor(
    private readonly keyCloakService: KeycloakService,
    private readonly configService: ConfigService,
    private readonly iconService: IconService,
    private readonly shellService: ShellService,
    private readonly sanitizer: DomSanitizer,
    private readonly pageHeaderService: PageHeaderService
  ) {}

  public ngOnInit(): void {
    this.iconService.registerAll([User20]);
    this.showUserNameInTopBar = this.configService.config.featureToggles?.showUserNameInTopBar;
    this.setLogo();
  }

  public ngAfterViewInit(): void {
    this.pageHeaderService.setHeaderViewContainerRef(this._headerVcr);
  }

  public toggleSideBar(): void {
    this.shellService.toggleSideBar();
  }

  public setPanelExpanded(expanded: boolean): void {
    this.shellService.setPanelExpanded(expanded);
  }

  public mouseEnter(): void {
    this.shellService.setMouseOnTopBar(true);
  }

  public mouseLeave(): void {
    this.shellService.setMouseOnTopBar(false);
  }

  private setLogo(): void {
    const config = this.configService.config;

    if (config.logoSvgBase64) {
      this.logoBase64 = this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:image/svg+xml;base64, ${config.logoSvgBase64}`
      );
    } else if (config.logoPngBase64) {
      this.logoBase64 = this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:image/png;base64, ${config.logoPngBase64}`
      );
    }
  }
}
