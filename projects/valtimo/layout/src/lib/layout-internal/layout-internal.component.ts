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

import {AfterViewInit, Component, Renderer2} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {LayoutService} from '../layout.service';
import {UserInterfaceService} from '@valtimo/user-interface';

// eslint-disable-next-line no-var
declare var App;

@Component({
  selector: 'valtimo-layout-internal',
  templateUrl: './layout-internal.component.html',
  styleUrls: ['./layout-internal.component.scss'],
})
export class LayoutInternalComponent implements AfterViewInit {
  readonly menuOpen$ = new BehaviorSubject<boolean>(true);
  readonly menuWidth$ = new BehaviorSubject<number>(undefined);

  readonly showPageHeader$ = this.userInterfaceService.showPageHeader$;

  constructor(
    public layoutService: LayoutService,
    private renderer: Renderer2,
    private readonly userInterfaceService: UserInterfaceService
  ) {
    this.renderer.addClass(document.body, 'be-animate');
  }

  ngAfterViewInit(): void {
    App.init();
  }

  menuWidthChanged(width: number): void {
    this.menuWidth$.next(width);
  }
}
