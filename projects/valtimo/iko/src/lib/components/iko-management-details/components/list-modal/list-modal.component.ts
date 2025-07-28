/*
 * Copyright 2015-2025 Ritense BV, the Netherlands.
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
import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal} from '@angular/core';
import {
  ButtonModule,
  InputModule,
  LayerModule,
  ModalModule,
  NumberModule,
  ToggleModule,
  TooltipModule,
} from 'carbon-components-angular';
import {TranslateModule} from '@ngx-translate/core';
import {IkoManagementApiService} from '../../../../services';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CarbonMultiInputModule,
  InputLabelModule,
  MultiInputOutput,
  MultiInputValues,
  runAfterCarbonModalClosed,
  SelectItem,
  SelectModule,
  ValtimoCdsModalDirective,
  ViewType,
} from '@valtimo/components';
import {
  CloseListColumnModalEvent,
  IkoListColumnCreateRequest,
  IkoListColumnModalType,
} from '../../../../models';
import {map} from 'rxjs/operators';
import {filter, Observable, Subscription, switchMap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  standalone: true,
  selector: 'valtimo-iko-management-list-modal',
  templateUrl: './list-modal.component.html',
  styleUrls: ['./list-modal.component.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    ModalModule,
    ValtimoCdsModalDirective,
    ButtonModule,
    InputModule,
    ReactiveFormsModule,
    LayerModule,
    SelectModule,
    ToggleModule,
    TooltipModule,
    CarbonMultiInputModule,
    InputLabelModule,
    NumberModule,
  ],
})
export class IkoManagementListModalComponent implements OnInit, OnDestroy {
  public readonly $openModal = signal<boolean>(false);
  @Input() public set openModal(value: boolean) {
    this.$openModal.set(value);
  }

  public readonly $type = signal<IkoListColumnModalType>(IkoListColumnModalType.ADD);
  @Input() public set type(value: IkoListColumnModalType) {
    this.$type.set(value);
  }

  @Output() public readonly closeModalEvent = new EventEmitter<CloseListColumnModalEvent>();

  public readonly form = this.formBuilder.group({
    title: this.formBuilder.control('', [Validators.required]),
    key: this.formBuilder.control('', [Validators.required]),
    path: this.formBuilder.control('', [Validators.required]),
    displayType: this.formBuilder.control('', [Validators.required]),
    sortable: this.formBuilder.control(false, [Validators.required]),
    defaultSort: this.formBuilder.control(''),
    dateFormat: this.formBuilder.control(''),
    tagAmount: this.formBuilder.control(1),
    booleanDisplayTypeParameters: this.formBuilder.control([
      {key: '', value: ''},
    ]) as FormControl<MultiInputOutput>,
    enumDisplayTypeParameters: this.formBuilder.control([
      {key: '', value: ''},
    ]) as FormControl<MultiInputOutput>,
  });
  public get title(): AbstractControl<string> {
    return this.form.get('title') as AbstractControl<string>;
  }
  public get key(): AbstractControl<string> {
    return this.form.get('key') as AbstractControl<string>;
  }
  public get path(): AbstractControl<string> {
    return this.form.get('path') as AbstractControl<string>;
  }
  public get displayType(): AbstractControl<string> {
    return this.form.get('displayType') as AbstractControl<string>;
  }
  public readonly isDateDisplayType$ = this.displayType.valueChanges.pipe(
    map(type => type === ViewType.DATE)
  );
  public readonly isBooleanDisplayType$ = this.displayType.valueChanges.pipe(
    map(type => type === ViewType.BOOLEAN)
  );
  public readonly isEnumDisplayType$ = this.displayType.valueChanges.pipe(
    map(type => type === ViewType.ENUM)
  );
  public readonly isTagsDisplayType$ = this.displayType.valueChanges.pipe(
    map(type => type === ViewType.TAGS)
  );
  public get sortable(): AbstractControl<boolean> {
    return this.form.get('sortable') as AbstractControl<boolean>;
  }
  public get defaultSort(): AbstractControl<string> {
    return this.form.get('defaultSort') as AbstractControl<string>;
  }
  public get dateFormat(): AbstractControl<string> {
    return this.form.get('dateFormat') as AbstractControl<string>;
  }

  private readonly _DISPLAY_TYPES: Array<ViewType> = [
    ViewType.TEXT,
    ViewType.DATE,
    ViewType.BOOLEAN,
    ViewType.ENUM,
    ViewType.ARRAY_COUNT,
    ViewType.UNDERSCORES_TO_SPACES,
    ViewType.TAGS,
  ];

  private readonly _dataAggregateKey$: Observable<string> = this.route.params.pipe(
    map(params => params?.key),
    filter(key => !!key)
  );

  public readonly displayTypeSelectItems: SelectItem[] = this._DISPLAY_TYPES.map(displayType => ({
    id: displayType,
    translationKey: `listColumnDisplayType.${displayType}`,
  }));

  public readonly sortSelectItems: SelectItem[] = [
    {
      translationKey: 'listColumn.sortableAsc',
      id: 'ASC',
    },
    {
      translationKey: 'listColumn.sortableDesc',
      id: 'DESC',
    },
  ];

  private readonly _subscriptions = new Subscription();

  constructor(
    private readonly ikoManagementApiService: IkoManagementApiService,
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this._subscriptions.add(
      this.defaultSort.valueChanges.subscribe(defaultSortValue => {
        if (defaultSortValue) {
          this.sortable.setValue(true);
          this.sortable.disable();
        } else {
          this.sortable.enable();
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public closeModal(): void {
    this.closeModalEvent.emit('close');
    runAfterCarbonModalClosed(() => this.form.reset());
  }

  public addColumn(): void {
    const formValue = this.form.getRawValue();

    this.disableForm();

    this._dataAggregateKey$
      .pipe(
        switchMap(dataAggregateKey => {
          return this.ikoManagementApiService.createIkoListColumn(
            dataAggregateKey,
            formValue.key,
            this.getCreateRequestBody(formValue)
          );
        })
      )
      .subscribe({
        next: () => {
          this.enableForm();
          this.closeModalEvent.emit(
            !!formValue.defaultSort ? {newDefaultSortKey: formValue.key} : 'closeAndRefresh'
          );
          runAfterCarbonModalClosed(() => {
            this.form.reset();
            this.form.markAsPristine();
            this.form.markAsUntouched();
            this.form.updateValueAndValidity();
          });
        },
        error: () => {
          this.enableForm();
        },
      });
  }

  private disableForm(): void {
    this.form.disable();
  }

  private enableForm(): void {
    this.form.enable();
  }

  private mapMultiInputValueToEnum(multiInputValues: MultiInputValues): Record<string, string> {
    return multiInputValues.reduce((acc, curr: any) => {
      return {...acc, [curr.key]: curr.value};
    }, {});
  }

  private splitDisplayTypeParameters(form: FormGroup): {
    rest: Partial<ReturnType<typeof form.getRawValue>>;
    split: Pick<
      ReturnType<typeof form.getRawValue>,
      'dateFormat' | 'booleanDisplayTypeParameters' | 'enumDisplayTypeParameters'
    >;
  } {
    const fullFormValue = form.getRawValue();

    const {dateFormat, booleanDisplayTypeParameters, enumDisplayTypeParameters, ...restFormValue} =
      fullFormValue;

    const split = {
      dateFormat,
      booleanDisplayTypeParameters,
      enumDisplayTypeParameters,
    };

    const filteredRestFormValue = {...restFormValue};

    if (filteredRestFormValue.defaultSort === '') {
      delete filteredRestFormValue.defaultSort;
    }

    return {rest: filteredRestFormValue, split};
  }

  private getCreateRequestBody(formValue: any): IkoListColumnCreateRequest {
    const splitDisplayTypeParameters = this.splitDisplayTypeParameters(this.form);

    return {
      key: formValue.key,
      path: formValue.path,
      sortable: Boolean(formValue.sortable),
      ...splitDisplayTypeParameters.rest,
      displayType: {
        type: formValue.displayType,
        displayTypeParameters: {},
        ...(formValue.displayType === 'date' && {
          displayTypeParameters: {dateFormat: splitDisplayTypeParameters.split.dateFormat},
        }),
        ...(formValue.displayType === 'enum' && {
          displayTypeParameters: {
            enum: this.mapMultiInputValueToEnum(
              splitDisplayTypeParameters.split.enumDisplayTypeParameters
            ),
          },
        }),
        ...(formValue.displayType === 'boolean' && {
          displayTypeParameters: {
            enum: this.mapMultiInputValueToEnum(
              splitDisplayTypeParameters.split.booleanDisplayTypeParameters
            ),
          },
        }),
      },
    };
  }
}
