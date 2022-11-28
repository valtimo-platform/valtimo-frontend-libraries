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

import {HttpClient} from '@angular/common/http';
import {Component, ElementRef, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {ContextService} from '@valtimo/context';
import {ValtimoVersion} from '../../models';
import {UserIdentity} from '@valtimo/config';
import {UserProviderService} from '@valtimo/security';
import {NGXLogger} from 'ngx-logger';
import {BehaviorSubject, combineLatest, take} from 'rxjs';
import {VersionService} from '../version/version.service';
import {ShellService} from '../../services/shell.service';

@Component({
  selector: 'valtimo-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RightSidebarComponent implements OnInit {
  @HostListener('document:click', ['$event.target'])
  public onPageClick(targetElement) {
    combineLatest([this.shellService.panelExpanded$, this.shellService.mouseOnTopBar$])
      .pipe(take(1))
      .subscribe(([panelExpanded, mouseOnTopBar]) => {
        const clickedInside =
          this.elementRef.nativeElement.contains(targetElement) || mouseOnTopBar;

        if (!clickedInside && panelExpanded) {
          this.shellService.setPanelExpanded(false);
        }
      });
  }

  public userIdentity: UserIdentity;
  public frequencies: Array<any>;
  public settingsForm: FormGroup;
  public build: ValtimoVersion;
  public userContexts: Array<any>;
  public userContextActive: any;

  readonly panelExpanded$ = this.shellService.panelExpanded$;

  readonly selectedLanguage$ = new BehaviorSubject<string>('');
  readonly languageOptions$ = new BehaviorSubject<Array<string>>([]);
  readonly updatingSettings$ = new BehaviorSubject<boolean>(false);

  constructor(
    public translate: TranslateService,
    private readonly userProviderService: UserProviderService,
    private readonly formBuilder: FormBuilder,
    private readonly versionService: VersionService,
    private readonly contextService: ContextService,
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly shellService: ShellService,
    private readonly elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.frequencies = [
      'emailNotificationOnMonday',
      'emailNotificationOnTuesday',
      'emailNotificationOnWednesday',
      'emailNotificationOnThursday',
      'emailNotificationOnFriday',
      'emailNotificationOnSaturday',
      'emailNotificationOnSunday',
    ];
    this.settingsForm = this.formBuilder.group({
      taskNotifications: new FormControl(false),
      emailNotifications: new FormControl(false),
      emailNotificationOnMonday: new FormControl(false),
      emailNotificationOnTuesday: new FormControl(false),
      emailNotificationOnWednesday: new FormControl(false),
      emailNotificationOnThursday: new FormControl(false),
      emailNotificationOnFriday: new FormControl(false),
      emailNotificationOnSaturday: new FormControl(false),
      emailNotificationOnSunday: new FormControl(false),
    });
    this.getUserSettings();
    this.setLanguage();
    this.loadUserSettingsTab();
  }

  private setLanguage(): void {
    this.selectedLanguage$.next(this.translate.currentLang);
    this.languageOptions$.next(this.translate.langs);
  }

  private loadContextSwitch() {
    combineLatest([
      this.contextService.getUserContexts(),
      this.contextService.getUserContextActive(),
    ]).subscribe(([userContexts, userContextActive]) => {
      this.userContextActive = userContextActive;
      this.userContexts = userContexts;
    });
  }

  public setUserContext(contextId: number) {
    this.contextService.setUserContext(contextId).subscribe();
    location.href = '/';
  }

  public loadUserSettingsTab() {
    this.userProviderService.getEmailNotificationSettings().subscribe(results => {
      if (results !== null) {
        this.settingsForm.controls.taskNotifications.setValue(results.taskNotifications);
        this.settingsForm.controls.emailNotifications.setValue(results.emailNotifications);
        this.settingsForm.controls.emailNotificationOnMonday.setValue(
          results.emailNotificationOnMonday
        );
        this.settingsForm.controls.emailNotificationOnTuesday.setValue(
          results.emailNotificationOnTuesday
        );
        this.settingsForm.controls.emailNotificationOnWednesday.setValue(
          results.emailNotificationOnWednesday
        );
        this.settingsForm.controls.emailNotificationOnThursday.setValue(
          results.emailNotificationOnThursday
        );
        this.settingsForm.controls.emailNotificationOnFriday.setValue(
          results.emailNotificationOnFriday
        );
        this.settingsForm.controls.emailNotificationOnSaturday.setValue(
          results.emailNotificationOnSaturday
        );
        this.settingsForm.controls.emailNotificationOnSunday.setValue(
          results.emailNotificationOnSunday
        );
      } else {
        // default is true in the database, even if api returns no content
        this.settingsForm.controls.taskNotifications.setValue(true);
      }
    });
    this.getVersion();
  }

  public getUserSettings() {
    this.userProviderService.getUserSubject().subscribe(userIdentity => {
      this.logger.debug('user', userIdentity);
      this.userIdentity = userIdentity;
      this.loadContextSwitch();
    });
  }

  public getVersion() {
    this.versionService.getVersion().subscribe((build: ValtimoVersion) => {
      this.build = build;
    });
  }
  onSettingsSubmit(): void {
    this.updatingSettings$.next(true);

    this.userProviderService.updateEmailNotificationSettings(this.settingsForm.value).subscribe(
      () => {
        this.updatingSettings$.next(false);
      },
      () => {
        this.updatingSettings$.next(false);
      }
    );
  }

  updateUserLanguage(langKey: string): void {
    this.translate
      .use(langKey)
      .pipe(take(1))
      .subscribe(() => {
        localStorage.setItem('langKey', langKey);
      });
  }

  logout() {
    this.userProviderService.logout();
  }
}
