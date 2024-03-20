/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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

import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {
  CARBON_THEME,
  CarbonListModule,
  CarbonMultiInputModule,
  TooltipIconModule,
  ViewType,
} from '@valtimo/components';
import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {
  CheckboxModule,
  DropdownModule,
  InputModule,
  ModalModule,
  TabsModule,
} from 'carbon-components-angular';
import {TaskManagementService} from '../../services';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {BehaviorSubject, combineLatest, map, Observable, startWith} from 'rxjs';
import {ListItem} from 'carbon-components-angular/dropdown/list-item.interface';
import {TaskListColumn, TaskListColumnModalType} from '../../models';

@Component({
  selector: 'valtimo-task-management-column-modal',
  templateUrl: './task-management-column-modal.component.html',
  styleUrls: ['./task-management-column-modal.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CarbonListModule,
    TranslateModule,
    TabsModule,
    FormsModule,
    ModalModule,
    CheckboxModule,
    DropdownModule,
    InputModule,
    ReactiveFormsModule,
    TooltipIconModule,
    CarbonMultiInputModule,
  ],
  providers: [TaskManagementService],
})
export class TaskManagementColumnModalComponent {
  @Input() public carbonTheme: CARBON_THEME = CARBON_THEME.G10;
  @Input() public set taskListColumns(value: TaskListColumn[]) {
    this._taskListColumns$.next(value);
  }
  @Input() public set type(value: TaskListColumnModalType) {
    this.type$.next(value);
    if (value === 'add') this.resetForm();
  }
  @Input() public set show(value: boolean) {
    this.show$.next(value);
  }
  @Output() closeEvent = new EventEmitter<void>();

  public readonly type$ = new BehaviorSubject<TaskListColumnModalType>('add');
  public readonly isAdd$ = this.type$.pipe(map(type => type === 'add'));
  public readonly isEdit$ = this.type$.pipe(map(type => type === 'edit'));
  public readonly show$ = new BehaviorSubject<boolean>(false);
  public readonly disabled$ = new BehaviorSubject<boolean>(false);

  private readonly _taskListColumns$ = new BehaviorSubject<TaskListColumn[]>([]);

  private readonly _INVALID_KEY = 'INVALID_KEY';

  private readonly DISPLAY_TYPES: Array<ViewType> = [
    ViewType.TEXT,
    ViewType.DATE,
    ViewType.BOOLEAN,
    ViewType.ENUM,
    ViewType.ARRAY_COUNT,
    ViewType.UNDERSCORES_TO_SPACES,
  ];

  public readonly formGroup = new FormGroup({
    title: new FormControl(''),
    key: new FormControl('', Validators.required, this.uniqueKeyValidator),
    path: new FormControl('', Validators.required),
    dateFormat: new FormControl(''),
    displayType: new FormControl(),
    sortable: new FormControl(false),
    defaultSort: new FormControl(),
    enum: new FormControl([]),
  });

  public get title(): AbstractControl<string> {
    return this.formGroup.get('title');
  }
  public get key(): AbstractControl<string> {
    return this.formGroup.get('key');
  }
  public get path(): AbstractControl<string> {
    return this.formGroup.get('path');
  }
  public get dateFormat(): AbstractControl<string> {
    return this.formGroup.get('dateFormat');
  }
  public get displayType(): AbstractControl<ViewType> {
    return this.formGroup.get('displayType');
  }
  public get sortable(): AbstractControl<boolean> {
    return this.formGroup.get('sortable');
  }

  public readonly validKey$: Observable<boolean> = combineLatest([
    this._taskListColumns$,
    this.key.valueChanges,
  ]).pipe(
    map(
      ([taskListColumns, keyValue]) =>
        !taskListColumns.find(
          column => column.key.toLowerCase().trim() === keyValue.trim().toLowerCase()
        )
    )
  );

  private readonly _selectedSortItemIndex$ = new BehaviorSubject<number>(0);

  public readonly sortItems$: Observable<Array<ListItem>> = combineLatest([
    this._selectedSortItemIndex$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([selectedSortItemIndex]) =>
      [
        {
          content: this.translateService.instant(`listColumn.selectDefaultSort`),
          key: this._INVALID_KEY,
        },
        {
          content: this.translateService.instant(`listColumn.sortableAsc`),
          key: 'ASC',
        },
        {
          content: this.translateService.instant(`listColumn.sortableDesc`),
          key: 'DESC',
        },
      ].map((item, index) => ({
        ...item,
        selected: index === selectedSortItemIndex,
      }))
    )
  );

  private readonly _selectedViewTypeItemIndex$ = new BehaviorSubject<number>(0);

  public readonly viewTypeItems$: Observable<Array<ListItem>> = combineLatest([
    this._selectedViewTypeItemIndex$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([selectedViewTypeItemIndex]) =>
      [
        {
          content: this.translateService.instant(`listColumnDisplayType.select`),
          key: this._INVALID_KEY,
        },
        ...this.DISPLAY_TYPES.map(type => ({
          content: this.translateService.instant(`listColumnDisplayType.${type}`),
          key: type,
        })),
      ].map((item, index) => ({
        ...item,
        selected: index === selectedViewTypeItemIndex,
      }))
    )
  );

  public readonly showDateFormat$ = this.formGroup.valueChanges.pipe(
    map(formValues => !!(formValues.displayType?.key === this.DISPLAY_TYPES[1]))
  );

  public readonly showEnum$ = this.formGroup.valueChanges.pipe(
    map(
      formValues =>
        !!(
          formValues.displayType?.key === this.DISPLAY_TYPES[3] ||
          formValues.displayType?.key === this.DISPLAY_TYPES[2]
        )
    )
  );

  public readonly isYesNo$ = this.formGroup.valueChanges.pipe(
    map(formValues => !!(formValues.displayType?.key === this.DISPLAY_TYPES[2]))
  );

  public readonly CARBON_THEME_WHITE = CARBON_THEME.WHITE;

  public readonly disableDefaultSort$ = combineLatest([
    this.type$,
    this._taskListColumns$,
    this.formGroup.valueChanges,
  ]).pipe(
    map(
      ([currentModalType, taskListColumns]) =>
        currentModalType === 'add' && this.taskListColumns.find(column => !!column.defaultSort)
    ),
    startWith(false)
  );

  constructor(private readonly translateService: TranslateService) {}

  public closeModal(): void {
    this.closeEvent.emit();
  }

  private resetForm(): void {
    this.formGroup.patchValue({
      title: '',
      key: '',
      dateFormat: '',
      displayType: '',
      sortable: false,
      defaultSort: '',
      enum: [],
    });
  }

  private disable(): void {
    this.disabled$.next(false);
  }

  private enable(): void {
    this.disabled$.next(true);
  }

  private uniqueKeyValidator(): Observable<{notUnique: boolean} | null> {
    return this.validKey$.pipe(map(validKey => (validKey ? null : {notUnique: true})));
  }
}
