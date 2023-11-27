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
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {NotificationService} from 'carbon-components-angular';

@Component({
  selector: 'valtimo-dossier-management-detail-container-actions',
  templateUrl: './dossier-management-detail-container-actions.html',
  styleUrls: ['./dossier-management-detail-container-actions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [NotificationService],
})
export class DossierManagementDetailContainerActionsComponent {
  @ViewChild('exportingMessage') private readonly _exportMessageTemplateRef: TemplateRef<any>;
  public readonly exporting$ = new BehaviorSubject<boolean>(false);

  @Input() documentDefinitionTitle = '';
  @Input() documentDefinitionName = '';

  constructor(private readonly notificationService: NotificationService) {}

  public export(): void {
    this.notificationService.showNotification({
      type: 'info',
      title: 'test',
      showClose: false,
      template: this._exportMessageTemplateRef,
    });
    this.exporting$.next(true);
  }
}
