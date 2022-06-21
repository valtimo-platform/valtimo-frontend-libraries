/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.See the License for the specific language governing permissions and limitations under the License.
 */

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PluginConfigurationComponent, PluginConfigurationData} from '../../../../models';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {ModalService, SelectItem, SelectItemId} from '@valtimo/user-interface';
import {OpenZaakService, ZaakType, ZaakTypeLink} from '@valtimo/resource';
import {map, switchMap} from 'rxjs/operators';
import {PluginTranslationService} from '../../../../services';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'valtimo-create-zaak-configuration',
  templateUrl: './create-zaak-configuration.component.html',
  styleUrls: ['./create-zaak-configuration.component.scss'],
})
export class CreateZaakConfigurationComponent implements PluginConfigurationComponent {
  @Input() clear$: Observable<void>;
  @Input() save$: Observable<void>;
  @Input() disabled: boolean;
  @Input() error: boolean;
  @Input() pluginId: string;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<PluginConfigurationData> =
    new EventEmitter<PluginConfigurationData>();

  zaakTypeLinkSelectItems$: Observable<Array<SelectItem> | null> =
    this.modalService.modalData$.pipe(
      switchMap(modalData => {
        if (modalData?.processDefinitionKey) {
          return this.openZaakService
            .getZaakTypeLinkListByProcess(modalData?.processDefinitionKey)
            .pipe(
              map(zaakTypeLinks =>
                zaakTypeLinks.map(link => ({
                  id: link.zaakTypeUrl,
                  text: link.documentDefinitionName,
                }))
              )
            );
        } else {
          return of(null);
        }
      })
    );

  private readonly selectedZaakTypeUrl$ = new BehaviorSubject<string>('');

  readonly selectedZaakType$: Observable<ZaakType | null> = combineLatest([
    this.selectedZaakTypeUrl$,
    this.openZaakService.getZaakTypes(),
  ]).pipe(
    map(([selectedZaakTypeUrl, zaakTypes]) => {
      return zaakTypes.find(zaakType => zaakType.url === selectedZaakTypeUrl);
    })
  );

  constructor(
    private readonly openZaakService: OpenZaakService,
    private readonly modalService: ModalService,
    private readonly pluginTranslationService: PluginTranslationService,
    private readonly toastr: ToastrService
  ) {}

  selectZaakTypeLink(zaakTypeUrl: SelectItemId): void {
    this.selectedZaakTypeUrl$.next(zaakTypeUrl as string);
  }

  clearZaakTypeLink(): void {
    this.selectedZaakTypeUrl$.next('');
  }
}
