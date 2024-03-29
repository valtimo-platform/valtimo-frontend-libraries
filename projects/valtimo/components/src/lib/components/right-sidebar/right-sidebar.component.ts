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

import {HttpClient} from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {ValtimoVersion} from '../../models';
import {
  ConfigService,
  EmailNotificationSettings,
  FeedbackMailTo,
  UserIdentity,
  UserSettings,
  UserSettingsService,
  VERSIONS,
} from '@valtimo/config';
import {UserProviderService} from '@valtimo/security';
import {NGXLogger} from 'ngx-logger';
import {BehaviorSubject, combineLatest, Observable, Subscription, switchMap, take} from 'rxjs';
import {VersionService} from '../version/version.service';
import {ShellService} from '../../services/shell.service';
import {map, tap} from 'rxjs/operators';

@Component({
  selector: 'valtimo-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: ['./right-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RightSidebarComponent implements OnInit, OnDestroy {
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

  public frequencies: Array<any> = [
    'emailNotificationOnMonday',
    'emailNotificationOnTuesday',
    'emailNotificationOnWednesday',
    'emailNotificationOnThursday',
    'emailNotificationOnFriday',
    'emailNotificationOnSaturday',
    'emailNotificationOnSunday',
  ];
  public settingsForm: FormGroup = this.formBuilder.group({
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
  public overrideFeedbackMenuItemToMailTo: FeedbackMailTo;
  readonly panelExpanded$ = this.shellService.panelExpanded$;

  readonly selectedLanguage$ = new BehaviorSubject<string>('');
  readonly languageOptions$ = new BehaviorSubject<Array<string>>([]);

  readonly backendVersion$: Observable<ValtimoVersion> = this.versionService.getVersion();

  readonly userSubject$: Observable<UserIdentity> = this.userProviderService.getUserSubject();

  readonly updatingSettings$ = new BehaviorSubject<boolean>(true);

  readonly updatingUserSettings$ = new BehaviorSubject<boolean>(true);

  private readonly emailNotificationSettings$ = new BehaviorSubject<EmailNotificationSettings>(
    undefined
  );

  readonly emailNotificationSettingsWithSideEffects$: Observable<EmailNotificationSettings> =
    this.emailNotificationSettings$.pipe(
      tap(results => {
        if (results) {
          this.settingsForm.setValue(results);
          this.updatingSettings$.next(false);
        }
      })
    );

  readonly collapsibleWidescreenMenu$ = this.shellService.collapsibleWidescreenMenu$;

  readonly frontendVersion!: string;

  private formSubscription!: Subscription;

  private hideValtimoVersionsForNonAdmins =
    this.configService?.config?.featureToggles?.hideValtimoVersionsForNonAdmins || false;

  readonly isAdmin$: Observable<boolean> = this.userProviderService
    .getUserSubject()
    .pipe(map(userIdentity => userIdentity?.roles.includes('ROLE_ADMIN')));

  public showValtimoVersions = true;

  constructor(
    public translate: TranslateService,
    private readonly userProviderService: UserProviderService,
    private readonly formBuilder: FormBuilder,
    private readonly versionService: VersionService,
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly shellService: ShellService,
    private readonly elementRef: ElementRef,
    private readonly configService: ConfigService,
    private readonly userSettingsService: UserSettingsService
  ) {
    this.frontendVersion = VERSIONS?.frontendLibraries;
    this.isAdmin$.subscribe(isAdmin => {
      if (this.hideValtimoVersionsForNonAdmins && !isAdmin) {
        this.showValtimoVersions = false;
      }
    });
  }

  showPlantATreeButton: boolean;
  resetUrl: string;

  ngOnInit(): void {
    this.setLanguage();
    this.loadEmailNotificationSettings();
    this.openFormSubscription();
    this.showPlantATreeButton = this.configService.config.featureToggles?.showPlantATreeButton;
    this.resetUrl = this.configService.config.changePasswordUrl?.endpointUri;
    this.overrideFeedbackMenuItemToMailTo =
      this.configService.config?.overrideFeedbackMenuItemToMailTo;
    this.getUserSettings();
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }

  updateUserLanguage(langKey: string, saveSettings = true): void {
    this.translate
      .use(langKey)
      .pipe(take(1))
      .subscribe(() => {
        localStorage.setItem('langKey', langKey);
        this.selectedLanguage$.next(langKey);

        if (saveSettings) {
          this.saveUserSettings();
        }
      });
  }

  setCollapsibleWidescreenMenu(collapsible: boolean, saveSettings = true): void {
    this.shellService.setCollapsibleWidescreenMenu(collapsible);

    if (saveSettings) {
      this.saveUserSettings();
    }
  }

  logout(): void {
    this.userProviderService.logout();
  }

  private openFormSubscription(): void {
    this.formSubscription = combineLatest([
      this.emailNotificationSettings$,
      this.settingsForm.valueChanges,
      this.updatingSettings$,
    ])
      .pipe(
        tap(([settings, formValue, updatingSettings]) => {
          if (settings && formValue) {
            const settingsStringified = JSON.stringify(this.sortObjectAlphabetically(settings));
            const formStringified = JSON.stringify(this.sortObjectAlphabetically(formValue));

            if (settingsStringified !== formStringified && !updatingSettings) {
              this.updatingSettings$.next(true);
              this.userProviderService.updateEmailNotificationSettings(formValue).subscribe(
                results => {
                  this.emailNotificationSettings$.next(results);
                  this.updatingSettings$.next(false);
                },
                () => {
                  this.emailNotificationSettings$.next(settings);
                  this.updatingSettings$.next(false);
                }
              );
            }
          }
        })
      )
      .subscribe();
  }

  private loadEmailNotificationSettings(): void {
    this.userProviderService.getEmailNotificationSettings().subscribe(results => {
      if (results) {
        this.emailNotificationSettings$.next(results);
      } else {
        this.emailNotificationSettings$.next(this.settingsForm.value);
      }
    });
  }

  private setLanguage(): void {
    this.selectedLanguage$.next(this.translate.currentLang);
    this.languageOptions$.next(this.translate.langs);
  }

  private sortObjectAlphabetically(jsObject: object): object {
    return Object.keys(jsObject)
      .sort()
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]: jsObject[key],
        }),
        {}
      );
  }

  private getUserSettings(): void {
    this.userSettingsService.getUserSettings().subscribe(settings => {
      this.updatingUserSettings$.next(false);

      if (!settings?.languageCode) {
        this.saveUserSettings();
      } else {
        this.setUserSettings(settings);
      }
    });
  }

  private saveUserSettings(): void {
    this.updatingUserSettings$.next(true);

    combineLatest([this.selectedLanguage$, this.collapsibleWidescreenMenu$])
      .pipe(
        take(1),
        switchMap(([languageCode, collapsibleWidescreenMenu]) =>
          this.userSettingsService.saveUserSettings({
            collapsibleWidescreenMenu,
            languageCode,
          })
        )
      )
      .subscribe(() => {
        this.updatingUserSettings$.next(false);
      });
  }

  private setUserSettings(settings: UserSettings): void {
    this.selectedLanguage$.next(settings.languageCode);
    this.updateUserLanguage(settings.languageCode, false);
    this.setCollapsibleWidescreenMenu(settings.collapsibleWidescreenMenu, false);
  }
}
