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
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {SelectedValue, SelectItem} from '../../models';
import {BehaviorSubject, Observable, Subscription, combineLatest, map} from 'rxjs';
import {ListItem} from 'carbon-components-angular';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'v-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements OnInit, OnChanges, OnDestroy {
  @Input() set items(value: Array<SelectItem>) {
    this._listItems$.next(
      value.map(
        item =>
          ({content: item.text || item.translationKey, id: item.id, selected: false} as ListItem)
      )
    );
  }
  @Input() defaultSelection!: SelectItem;
  @Input() defaultSelectionId!: string;
  @Input() defaultSelectionIds!: Array<string>;
  @Input() clearable = true;
  @Input() disabled = false;
  @Input() multiple = false;
  @Input() margin = false;
  @Input() widthInPx!: number;
  @Input() notFoundText!: string;
  @Input() clearAllText!: string;
  @Input() name = '';
  @Input() title = '';
  @Input() titleTranslationKey = '';
  @Input() clearSelectionSubject$!: Observable<void>;
  @Input() tooltip = '';
  @Input() required = false;
  @Input() loading = false;
  @Input() loadingText = '';
  @Input() placeholder = '';
  @Input() smallMargin = false;

  @Output() selectedChange: EventEmitter<SelectedValue> = new EventEmitter();
  @Output() clear: EventEmitter<any> = new EventEmitter();

  public readonly selected$ = new BehaviorSubject<SelectedValue>('');
  private readonly _listItems$ = new BehaviorSubject<Array<ListItem>>([]);

  public readonly listItems$ = combineLatest([
    this._listItems$,
    this.selected$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([listItems, selected]) =>
      listItems.map(listItem => {
        const translation = this.translateService.instant(listItem.content);
        const isSelected: boolean = Array.isArray(selected)
          ? selected.includes(listItem.id)
          : selected === listItem.id;

        return {
          ...listItem,
          selected: isSelected,
          content: translation !== listItem.content ? translation : listItem.content,
        };
      })
    )
  );
  private _selectedSubscription!: Subscription;
  private _clearSubjectSubscription!: Subscription;

  constructor(private readonly translateService: TranslateService) {}

  setSelectedValue(selectedValue: SelectedValue): void {
    this.selected$.next(selectedValue);
  }

  ngOnInit() {
    this.setDefaultSelection();
    this.openSelectedSubscription();
    this.openClearSubjectSubscription();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.items?.currentValue ||
      changes?.defaultSelectionId?.currentValue ||
      changes?.defaultSelection?.currentValue ||
      changes?.defaultSelectionIds?.currentValue
    ) {
      this.setDefaultSelection();
    }
  }

  ngOnDestroy() {
    this._selectedSubscription?.unsubscribe();
    this._clearSubjectSubscription?.unsubscribe();
  }

  clearSelection(): void {
    this.clear.emit();
  }

  private setDefaultSelection(): void {
    const itemsIds = this.items?.map(item => item.id);
    const defaultSelectionIds = this.defaultSelectionIds;
    const defaultSelectionId = this.defaultSelection?.id || this.defaultSelectionId;

    if (this.multiple && this.defaultSelectionIds) {
      this.setSelectedValue([...defaultSelectionIds]);
    } else if (defaultSelectionId && itemsIds?.includes(defaultSelectionId)) {
      if (this.multiple) {
        this.setSelectedValue([defaultSelectionId]);
        this.setSelectedValue([defaultSelectionId]);
      } else {
        this.setSelectedValue(defaultSelectionId);
      }
    } else if (defaultSelectionId && !itemsIds?.includes(defaultSelectionId)) {
      if (this.multiple) {
        this.setSelectedValue([]);
      } else {
        this.setSelectedValue('');
      }
    }
  }

  private openSelectedSubscription(): void {
    this._selectedSubscription = this.selected$.subscribe(selectedValue => {
      const defaultSelectionId = this.defaultSelection?.id || this.defaultSelectionId;

      if ((!this.multiple && selectedValue !== defaultSelectionId) || this.multiple) {
        this.selectedChange.emit(selectedValue);
      }
    });
  }

  private openClearSubjectSubscription(): void {
    if (this.clearSelectionSubject$) {
      this._clearSubjectSubscription = this.clearSelectionSubject$.subscribe(() => {
        if (this.multiple) {
          this.setSelectedValue([]);
        } else {
          this.setSelectedValue('');
        }
      });
    }
  }
}
