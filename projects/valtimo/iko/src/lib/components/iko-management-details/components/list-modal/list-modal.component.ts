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
import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {
  ButtonModule,
  InputModule,
  LayerModule,
  ModalModule,
  ToggleModule,
  TooltipModule,
} from 'carbon-components-angular';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {IkoManagementApiService} from '../../../../services';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CARBON_CONSTANTS,
  CarbonMultiInputModule,
  SelectItem,
  SelectModule,
  ValtimoCdsModalDirective,
  ViewType,
} from '@valtimo/components';
import {IkoListColumnModalType} from '../../../../models';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

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
  ],
})
export class IkoManagementListModalComponent {
  public readonly $openModal = signal<boolean>(false);
  @Input() public set openModal(value: boolean) {
    this.$openModal.set(value);
  }

  public readonly $type = signal<IkoListColumnModalType>(IkoListColumnModalType.ADD);
  @Input() public set type(value: IkoListColumnModalType) {
    this.$type.set(value);
  }

  @Output() public readonly closeModalEvent = new EventEmitter<void>();

  public readonly form = this.formBuilder.group({
    title: this.formBuilder.control('', [Validators.required]),
    key: this.formBuilder.control('', [Validators.required]),
    path: this.formBuilder.control('', [Validators.required]),
    displayTypeType: this.formBuilder.control(ViewType.TEXT, [Validators.required]),
    sortable: this.formBuilder.control(false, [Validators.required]),
    defaultSort: this.formBuilder.control('', [Validators.required]),
    dateFormat: this.formBuilder.control(''),
    booleanDisplayTypeParameters: this.formBuilder.control(''),
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
  public get displayTypeType(): AbstractControl<string> {
    return this.form.get('displayTypeType') as AbstractControl<string>;
  }
  public readonly isDateDisplayType$ = this.displayTypeType.valueChanges.pipe(
    map(type => type === ViewType.DATE)
  );
  public readonly isBooleanDisplayType$ = this.displayTypeType.valueChanges.pipe(
    map(type => type === ViewType.BOOLEAN)
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
  public get booleanDisplayTypeParameters(): FormControl<[]> {
    return this.form.get('booleanDisplayTypeParameters') as any as FormControl<[]>;
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

  public readonly displayTypeSelectItems$: Observable<SelectItem[]> = this.translateService
    .stream('key')
    .pipe(
      map(() =>
        this._DISPLAY_TYPES.map(displayType => ({
          id: displayType,
          text: this.translateService.instant(`listColumnDisplayType.${displayType}`),
        }))
      )
    );

  public readonly sortSelectItems: SelectItem[] = [
    {
      text: 'listColumn.sortableAsc',
      id: 'ASC',
    },
    {
      text: 'listColumn.sortableDesc',
      id: 'DESC',
    },
  ];

  constructor(
    private readonly ikoManagementApiService: IkoManagementApiService,
    private readonly formBuilder: FormBuilder,
    private readonly translateService: TranslateService
  ) {
    this.form.valueChanges.subscribe(x => console.log(x));
  }

  public closeModal(): void {
    this.closeModalEvent.emit();

    setTimeout(() => {
      this.form.reset();
    }, CARBON_CONSTANTS.modalAnimationMs);
  }

  public addColumn(): void {
    console.log(event);
  }
}
