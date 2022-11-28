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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {MenuItem} from '@valtimo/config';
import {Observable, Subscription} from 'rxjs';
import {MenuService} from './menu.service';

@Component({
  selector: 'valtimo-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit, OnDestroy {
  public menuItems: MenuItem[];
  public includeFunctionObservables: {[key: string]: Observable<boolean>} = {};
  private menuItemSubscription: Subscription;

  constructor(private menuService: MenuService) {
    this.includeFunctionObservables = this.menuService.includeFunctionObservables;
  }

  ngOnInit(): void {
    this.menuItemSubscription = this.menuService.menuItems$.subscribe(
      value => (this.menuItems = value)
    );
  }

  ngOnDestroy(): void {
    this.menuItemSubscription.unsubscribe();
  }
}
