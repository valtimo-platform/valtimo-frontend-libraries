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
import {SelectItem, SelectItemId} from '../../models';
import {BehaviorSubject, Subscription} from 'rxjs';

@Component({
  selector: 'v-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements OnInit, OnDestroy {
  @Input() items: Array<SelectItem> = [];
  @Input() defaultSelection!: SelectItem;
  @Input() clearable: boolean = true;

  @Output() selectedIdChange: EventEmitter<SelectItemId> = new EventEmitter();

  selectedItemId$ = new BehaviorSubject<SelectItemId>('');

  private selectedItemIdSubscription!: Subscription;

  selectedItemChange(id: SelectItemId): void {
    this.selectedItemId$.next(id);
  }

  ngOnInit() {
    this.setDefaultSelection();
    this.openSelectedItemIdSubscription();
  }

  ngOnDestroy() {
    this.selectedItemIdSubscription?.unsubscribe();
  }

  private setDefaultSelection(): void {
    if (this.defaultSelection) {
      this.selectedItemId$.next(this.defaultSelection.id);
    }
  }

  private openSelectedItemIdSubscription(): void {
    this.selectedItemIdSubscription = this.selectedItemId$.subscribe(id => {
      if (id) {
        this.selectedIdChange.emit(id);
      }
    });
  }
}
