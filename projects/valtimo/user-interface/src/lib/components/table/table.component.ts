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

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {BehaviorSubject, Subscription} from 'rxjs';
import {SelectItem, TableColumn, TablePagination} from '../../models';

@Component({
  selector: 'v-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() items!: Array<Object>;
  @Input() columns!: Array<TableColumn>;
  @Input() loading: boolean = false;
  @Input() showEditButtons: boolean = false;
  @Input() editButtonTranslationKey!: string;
  @Input() mobileBreakpointPx: number = 768;
  @Input() amountOfLoadingRows: number = 3;
  @Input() pagination?: TablePagination;

  @Output() editButtonClicked: EventEmitter<any> = new EventEmitter();

  readonly isMobile$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = new BehaviorSubject<boolean>(true);

  readonly paginationOptions: Array<SelectItem> = [
    {id: '10', text: '10'},
    {id: '25', text: '25'},
    {id: '50', text: '50'},
    {id: '100', text: '100'},
  ];

  private breakpointSubscription!: Subscription;

  constructor(private readonly breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    console.log(this.pagination);
    this.openBreakpointSubscription();
  }

  ngOnDestroy() {
    this.breakpointSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    const loadingChange = changes?.loading;

    if (loadingChange) {
      this.loading$.next(loadingChange.currentValue);
    }
  }

  getArrayOfLength(length: number): Array<0> {
    return new Array(length).fill(0);
  }

  private openBreakpointSubscription(): void {
    this.breakpointSubscription = this.breakpointObserver
      .observe([`(min-width: ${this.mobileBreakpointPx}px)`])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isMobile$.next(false);
        } else {
          this.isMobile$.next(true);
        }
      });
  }
}
