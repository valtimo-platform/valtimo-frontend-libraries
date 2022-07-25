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

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
  FunctionConfigurationComponent,
  FunctionConfigurationData,
  PluginConfigurationComponent,
  PluginConfigurationData,
} from '../../../../models';
import {BehaviorSubject, combineLatest, map, Observable, Subscription, take} from 'rxjs';
import {StoreTempDocumentConfig, DocumentLanguage, DocumentStatus} from '../../models';
import {TranslateService} from '@ngx-translate/core';
import {PluginTranslationService} from '../../../../services';

@Component({
  selector: 'valtimo-store-temp-document-configuration',
  templateUrl: './store-temp-document-configuration.component.html',
  styleUrls: ['./store-temp-document-configuration.component.scss'],
})
export class StoreTempDocumentConfigurationComponent
  implements FunctionConfigurationComponent, OnInit, OnDestroy
{
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Input() prefillConfiguration$: Observable<StoreTempDocumentConfig>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<StoreTempDocumentConfig> =
    new EventEmitter<StoreTempDocumentConfig>();

  readonly LANGUAGE_ITEMS: Array<DocumentLanguage> = ['nld'];
  readonly languageSelectItems$: Observable<Array<{id: DocumentLanguage; text: string}>> =
    this.translateService.stream('key').pipe(
      map(() =>
        this.LANGUAGE_ITEMS.map(item => ({
          id: item,
          text: this.pluginTranslationService.instant(item, this.pluginId),
        }))
      )
    );
  readonly STATUS_ITEMS: Array<DocumentStatus> = [
    'in_bewerking',
    'ter_vaststelling',
    'definitief',
    'gearchiveerd',
  ];
  readonly statusSelectItems$: Observable<Array<{id: DocumentStatus; text: string}>> =
    this.translateService.stream('key').pipe(
      map(() =>
        this.STATUS_ITEMS.map(item => ({
          id: item,
          text: this.pluginTranslationService.instant(item, this.pluginId),
        }))
      )
    );

  private saveSubscription!: Subscription;
  private readonly formValue$ = new BehaviorSubject<StoreTempDocumentConfig | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly translateService: TranslateService,
    private readonly pluginTranslationService: PluginTranslationService
  ) {}

  ngOnInit(): void {
    this.openSaveSubscription();
  }

  ngOnDestroy(): void {
    this.saveSubscription?.unsubscribe();
  }

  formValueChange(formValue: StoreTempDocumentConfig): void {
    this.formValue$.next(formValue);
    this.handleValid(formValue);
  }

  private handleValid(formValue: StoreTempDocumentConfig): void {
    const valid = !!(
      formValue.localDocumentLocation &&
      formValue.taal &&
      formValue.status &&
      formValue.informatieobjecttype
    );

    this.valid$.next(valid);
    this.valid.emit(valid);
  }

  private openSaveSubscription(): void {
    this.saveSubscription = this.save$?.subscribe(save => {
      combineLatest([this.formValue$, this.valid$])
        .pipe(take(1))
        .subscribe(([formValue, valid]) => {
          if (valid) {
            this.configuration.emit(formValue);
          }
        });
    });
  }
}
