/*
 * Copyright 2015-2025 Ritense BV, the Netherlands.
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
import {CommonModule} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  CARBON_CONSTANTS,
  CarbonListModule,
  ColumnConfig,
  PageTitleService,
  ValtimoCdsModalDirective,
} from '@valtimo/components';
import {IkoApiService, IkoManagementApiService} from '../../services';
import {BehaviorSubject, combineLatest, filter, Subscription, tap} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {
  ButtonModule,
  IconModule,
  InputModule,
  LayerModule,
  ModalModule,
  TabsModule,
} from 'carbon-components-angular';
import {TranslateModule} from '@ngx-translate/core';
import {IKO_MANAGEMENT_TABS} from '../../constants';
import {IkoRepositoryConfigListResponse} from '../../models';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'valtimo-iko-management-api',
  standalone: true,
  templateUrl: './iko-management-api.component.html',
  imports: [
    CommonModule,
    CarbonListModule,
    TabsModule,
    TranslateModule,
    ModalModule,
    ButtonModule,
    IconModule,
    FormsModule,
    InputModule,
    ReactiveFormsModule,
    ValtimoCdsModalDirective,
    LayerModule,
  ],
  styleUrl: './iko-management-api.component.scss',
})
export class IkoManagementApiComponent implements OnInit, OnDestroy {
  public readonly openModal$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public readonly loading$ = new BehaviorSubject<boolean>(true);

  private readonly _key$ = this.route.params.pipe(
    map(params => params?.key),
    filter(key => !!key)
  );

  public readonly apiConfigs$ = this.ikoManagementApiService.getIkoRepositoryConfigs().pipe(
    map(res => res.content),
    tap(() => this.loading$.next(false))
  );

  public readonly currentMenuItem$ = combineLatest([
    this._key$,
    this.ikoApiService.cachedMenuItems$,
  ]).pipe(
    map(([key, items]) => {
      const currentItem = items.find(item => item.key === key);
      if (!currentItem) return;
      this.pageTitleService.setCustomPageTitle(currentItem.title || '-');
    })
  );

  public readonly FIELDS: ColumnConfig[] = [
    {
      key: 'title',
      label: 'ikoManagement.title',
    },
  ];

  public readonly TABS = IKO_MANAGEMENT_TABS;

  public readonly form = this.formBuilder.group({
    pluginId: this.formBuilder.control('', [Validators.required]),
    apiKey: this.formBuilder.control('', [Validators.required]),
    baseUrl: this.formBuilder.control('', [Validators.required]),
  });

  private readonly _subscriptions = new Subscription();

  constructor(
    private readonly ikoManagementApiService: IkoManagementApiService,
    private readonly ikoApiService: IkoApiService,
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService,
    private readonly router: Router,
    private readonly formBuilder: FormBuilder
  ) {}

  public ngOnInit(): void {
    this.pageTitleService.disableReset();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
    this.pageTitleService.enableReset();
  }

  public onRowClicked(event: IkoRepositoryConfigListResponse): void {
    this.router.navigate(['iko-management', event.key]);
  }

  public openModal(): void {
    this.openModal$.next(true);
  }

  public closeModal(): void {
    this.openModal$.next(false);

    setTimeout(() => {
      this.form.reset();
    }, CARBON_CONSTANTS.modalAnimationMs);
  }

  public getControlInvalid(controlKey: string): boolean {
    const control: AbstractControl | null = this.form.get(controlKey);

    if (!control) {
      return true;
    }

    return !control.valid && !control.pristine;
  }

  public createApiConfig(): void {
    // const control: AbstractControl | null = this.form.get('title');
    // if (!control || !control.valid) {
    //   return;
    // }
    //
    // const newDashboard: DashboardItem = this.form.getRawValue();
    // this.dashboardManagementService.dispatchAction(
    //   this.dashboardManagementService.createDashboard(newDashboard).pipe(
    //     finalize(() => {
    //       this.closeModal();
    //     })
    //   )
    // );
  }
}
