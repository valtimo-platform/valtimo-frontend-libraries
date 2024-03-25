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
  CARBON_CONSTANTS,
  CARBON_THEME,
  CarbonListModule,
  CarbonMultiInputModule,
  MultiInputValues,
  TooltipIconModule,
  ViewType,
} from '@valtimo/components';
import {CommonModule} from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {
  ButtonModule,
  CheckboxModule,
  DropdownModule,
  InputModule,
  ModalModule,
  TabsModule,
} from 'carbon-components-angular';
import {TaskManagementApiService, TaskManagementService} from '../../services';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {BehaviorSubject, combineLatest, map, Observable, tap} from 'rxjs';
import {
  TaskListColumn,
  TaskListColumnDefaultSort,
  TaskListColumnEnum,
  TaskListColumnListItem,
  TaskListColumnModalCloseEvent,
  TaskListColumnModalType,
} from '../../models';
import {distinctUntilChanged} from 'rxjs/operators';
import {isEqual} from 'lodash';

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
    ButtonModule,
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
  }
  public get type(): TaskListColumnModalType {
    return this.type$.getValue();
  }
  @Input() public set show(showModal: boolean) {
    this.show$.next(showModal);

    if (showModal && this.type === 'add') {
      this.resetForm();
    }
  }
  @Input() public documentDefinitionName!: string;
  @Output() closeEvent = new EventEmitter<TaskListColumnModalCloseEvent>();

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

  private getInvalidListItem = (translateKey: string): TaskListColumnListItem => ({
    content: this.translateService.instant(translateKey),
    key: this._INVALID_KEY,
    selected: true,
  });

  private uniqueKeyValidator = (
    keyFormControl: AbstractControl<TaskListColumnListItem>
  ): {notUnique: boolean} | null => {
    const taskListColumns = this._taskListColumns$.getValue();

    return !taskListColumns?.find(
      column => column?.key?.trim()?.toLowerCase() === keyFormControl?.value?.trim()?.toLowerCase()
    )
      ? null
      : {notUnique: true};
  };

  private listItemValidator = (
    listItemControl: AbstractControl<TaskListColumnListItem>
  ): {invalidItem: boolean} | null =>
    listItemControl?.value?.key && listItemControl.value.key !== this._INVALID_KEY
      ? null
      : {invalidItem: true};

  public readonly formGroup = new FormGroup({
    title: new FormControl(null),
    key: new FormControl(null, [this.uniqueKeyValidator.bind(this), Validators.required]),
    path: new FormControl(null, Validators.required),
    dateFormat: new FormControl(null),
    displayType: new FormControl(this.getInvalidListItem(`listColumn.selectDefaultSort`), [
      Validators.required,
      this.listItemValidator.bind(this),
    ]),
    sortable: new FormControl(false),
    defaultSort: new FormControl(this.getInvalidListItem(`listColumn.selectDefaultSort`), [
      Validators.required,
    ]),
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
  public get displayType(): AbstractControl<TaskListColumnListItem> {
    return this.formGroup.get('displayType');
  }
  public get sortable(): AbstractControl<boolean> {
    return this.formGroup.get('sortable');
  }
  public get defaultSort(): AbstractControl<TaskListColumnListItem> {
    return this.formGroup.get('defaultSort');
  }

  private readonly _selectedSortItemIndex$ = new BehaviorSubject<number>(0);

  public readonly sortItems$: Observable<Array<TaskListColumnListItem>> = combineLatest([
    this._selectedSortItemIndex$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([selectedSortItemIndex]) =>
      [
        this.getInvalidListItem(`listColumn.selectDefaultSort`),
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

  public readonly viewTypeItems$: Observable<Array<TaskListColumnListItem>> = combineLatest([
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

  private _showDateFormat!: boolean;

  public readonly showDateFormat$ = this.formGroup.valueChanges.pipe(
    map(formValues => !!(formValues.displayType?.key === this.DISPLAY_TYPES[1])),
    tap(showDateFormat => (this._showDateFormat = showDateFormat))
  );

  private _showEnum!: boolean;

  public readonly showEnum$ = this.formGroup.valueChanges.pipe(
    map(
      formValues =>
        !!(
          formValues.displayType?.key === this.DISPLAY_TYPES[3] ||
          formValues.displayType?.key === this.DISPLAY_TYPES[2]
        )
    ),
    tap(showEnum => (this._showEnum = showEnum))
  );

  public readonly isYesNo$ = this.formGroup.valueChanges.pipe(
    map(formValues => !!(formValues.displayType?.key === this.DISPLAY_TYPES[2]))
  );

  public readonly CARBON_THEME_WHITE = CARBON_THEME.WHITE;

  public readonly disableDefaultSort$ = combineLatest([this._taskListColumns$, this.show$]).pipe(
    map(([taskListColumns]) => taskListColumns?.find(column => !!column.defaultSort))
  );

  private readonly _DEFAULT_ENUM_VALUES: MultiInputValues = [{key: '', value: ''}];

  private readonly _enumValues$ = new BehaviorSubject<MultiInputValues>(this._DEFAULT_ENUM_VALUES);

  public get enumValues$(): Observable<MultiInputValues> {
    return this._enumValues$.pipe(
      distinctUntilChanged((previous, current) => isEqual(previous, current))
    );
  }

  constructor(
    private readonly translateService: TranslateService,
    private readonly taskManagementApiService: TaskManagementApiService
  ) {}

  public closeModal(): void {
    this.closeEvent.emit('close');
  }

  public save(): void {
    this.disable();

    this.taskManagementApiService
      .updateTaskListColumn(
        this.documentDefinitionName,
        this.getTaskListColumnFromFormValue(this._showEnum, this._showDateFormat)
      )
      .subscribe({
        next: () => {
          this.closeModalAndRefresh();
          this.enableAfterTimeout();
        },
        error: () => {
          this.enable();
        },
      });
  }

  public enumValueChange(value: MultiInputValues): void {
    this._enumValues$.next(value);
  }

  private resetEnumValues(): void {
    this._enumValues$.next(this._DEFAULT_ENUM_VALUES);
  }

  private resetForm(): void {
    this.resetEnumValues();
    this.formGroup.reset({
      title: null,
      key: null,
      dateFormat: null,
      displayType: this.getInvalidListItem('listColumnDisplayType.select'),
      sortable: false,
      defaultSort: this.getInvalidListItem(`listColumn.selectDefaultSort`),
      enum: [],
    });
  }

  private disable(): void {
    this.disabled$.next(false);
  }

  private enableAfterTimeout(): void {
    setTimeout(() => {
      this.enable();
    }, CARBON_CONSTANTS.modalAnimationMs);
  }

  private enable(): void {
    this.disabled$.next(true);
  }

  private closeModalAndRefresh(): void {
    this.closeEvent.emit('refresh');
  }

  private getTaskListColumnFromFormValue(
    includeEnum: boolean,
    includeDateFormat: boolean
  ): TaskListColumn {
    const enumValues = this._enumValues$.getValue();
    const validEnumValues =
      enumValues.length > 0 && enumValues.filter(value => value.value && value.key);
    const mappedEnumValues = validEnumValues && this.mapEnumValues(validEnumValues);

    const formValue = this.formGroup.value;
    const taskListColumn: TaskListColumn = {
      ...(formValue.title && {title: formValue.title}),
      key: formValue.key,
      path: formValue.path,
      displayType: {
        type: formValue.displayType.key,
        displayTypeParameters: {
          ...(includeDateFormat && formValue.dateFormat && {dateFormat: formValue.dateFormat}),
          ...(includeEnum && mappedEnumValues && {enum: mappedEnumValues}),
        },
      },
      sortable: formValue.sortable,
      ...(formValue.defaultSort.key !== this._INVALID_KEY && {
        defaultSort: formValue.defaultSort.key as TaskListColumnDefaultSort,
      }),
    };

    return taskListColumn;
  }

  private mapEnumValues(enumValues: MultiInputValues): TaskListColumnEnum {
    return enumValues.reduce((acc, curr) => {
      return {...acc, [curr.key]: curr.value};
    }, {});
  }
}
