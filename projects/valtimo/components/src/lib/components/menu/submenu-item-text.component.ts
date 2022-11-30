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

import {Component, Input} from '@angular/core';
import {MenuItem} from '@valtimo/config';

@Component({
  selector: 'valtimo-submenu-item-text',
  template: `
    <span
      [ngClass]="submenuItem.textClass"
      *ngIf="{
        translation: submenuItem.title | translate,
        pageTranslation: 'pages.' + submenuItem.title.toLowerCase() + '.title' | translate,
        badgeCount: submenuItem.badgeCount$ | async
      } as obs"
    >
      {{
        (obs.pageTranslation !== 'pages.' + submenuItem.title.toLowerCase() + '.title'
          ? obs.pageTranslation
          : '') ||
          (obs.translation !== submenuItem.title ? obs.translation : '') ||
          submenuItem.title
      }}
      <span *ngIf="obs.badgeCount" class="badge badge-pill badge-primary">
        {{ obs.badgeCount }}
      </span>
      <ng-container *ngIf="!submenuItem.link">&gt;</ng-container>
    </span>
  `,
})
export class SubmenuItemTextComponent {
  @Input() submenuItem: MenuItem;
}
