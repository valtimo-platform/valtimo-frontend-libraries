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
import {PluginConfigurationComponent, PluginConfigurationData} from '../../../../models';
import {BehaviorSubject, combineLatest, Observable, Subject, Subscription} from 'rxjs';
import {SelectItem} from '@valtimo/user-interface';
import {ZaakType} from '@valtimo/resource';
import {map, tap} from 'rxjs/operators';

@Component({
  selector: 'valtimo-set-status-configuration',
  templateUrl: './set-status-configuration.component.html',
  styleUrls: ['./set-status-configuration.component.scss'],
})
export class SetStatusConfigurationComponent
  implements PluginConfigurationComponent, OnInit, OnDestroy
{
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<PluginConfigurationData> =
    new EventEmitter<PluginConfigurationData>();

  private readonly selectedStatus = new BehaviorSubject<string>('');

  readonly selectedZaakType$ = new BehaviorSubject<ZaakType | null>(null);

  readonly STATUSES: Array<string> = [
    'Geregistreerd',
    'Geaccepteerd',
    'In behandeling genomen',
    'Afgehandeld',
  ];

  readonly statusesSelectItems: Array<SelectItem> = this.STATUSES.map(status => ({
    id: status,
    text: status,
  }));

  readonly clearSubject$ = new Subject();

  private validSubscription!: Subscription;

  ngOnInit(): void {
    this.openValidSubscription();
  }

  ngOnDestroy(): void {
    this.validSubscription?.unsubscribe();
  }

  selectZaakType(zaakType: ZaakType | null): void {
    this.selectedZaakType$.next(zaakType);

    if (!zaakType) {
      this.clearStatus();
    }
  }

  clearStatus(): void {
    this.selectedStatus.next('');
    this.clearSubject$.next(null);
  }

  selectStatus(status: string): void {
    this.selectedStatus.next(status);
  }

  private openValidSubscription(): void {
    this.validSubscription = combineLatest([this.selectedStatus, this.selectedZaakType$])
      .pipe(
        tap(([status, zaakType]) => {
          if (status && zaakType) {
            this.valid.emit(true);
          } else {
            this.valid.emit(false);
          }
        })
      )
      .subscribe();
  }
}
