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

import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {
  ButtonModule,
  DropdownModule,
  IconModule,
  IconService,
  InputModule,
  ListItem,
} from 'carbon-components-angular';
import {WidgetContentComponent} from '../../../models';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {TrashCan16} from '@carbon/icons';
import {Subscription, debounceTime} from 'rxjs';

interface FieldsData {
  type: ListItem;
  content: string;
  label: string;
}

@Component({
  selector: 'valtimo-dossier-management-widget-fields',
  templateUrl: './dossier-management-widget-fields.component.html',
  styleUrls: ['./dossier-management-widget-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    DropdownModule,
    InputModule,
    ReactiveFormsModule,
    IconModule,
  ],
})
export class DossierManagementWidgetFieldsComponent
  implements WidgetContentComponent, OnInit, OnDestroy
{
  @HostBinding('class') public readonly class = 'valtimo-dossier-management-widget-field';
  @Input({required: true}) public set columnData(value: FieldsData[]) {
    if (!value) return;

    const rowsControl = this.formGroup.get('rows') as FormArray;
    if (!rowsControl) return;

    value.forEach((row: FieldsData) => {
      rowsControl.push(
        this.fb.group({
          type: this.fb.control<ListItem>(row.type, Validators.required),
          label: this.fb.control<string>(row.label, Validators.required),
          content: this.fb.control<string>(row.content, Validators.required),
        })
      );
    });

    this.cdr.detectChanges();
  }
  @Output() public changeEvent = new EventEmitter<{data: (FieldsData | null)[]; valid: boolean}>();

  public formGroup = this.fb.group({
    rows: this.fb.array<FieldsData>([]),
  });

  public get formRows(): FormArray | undefined {
    if (!this.formGroup.get('rows')) return undefined;

    return this.formGroup.get('rows') as FormArray;
  }

  public items: ListItem[] = [
    {
      content: 'test1',
      selected: false,
    },
    {
      content: 'test2',
      selected: false,
    },
    {
      content: 'test3',
      selected: false,
    },
  ];

  public getItemsSelected(row: AbstractControl): ListItem[] {
    const typeControlValue: ListItem = row.get('type')?.value;

    if (!typeControlValue) return this.items;

    return this.items.map((item: ListItem) => ({
      ...item,
      selected: typeControlValue.content === item.content && typeControlValue.selected,
    }));
  }

  private _subscriptions = new Subscription();

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly iconService: IconService
  ) {
    this.iconService.register(TrashCan16);
  }

  public ngOnInit(): void {
    this._subscriptions.add(
      this.formGroup
        .get('rows')
        ?.valueChanges.pipe(debounceTime(100))
        .subscribe((rows: (FieldsData | null)[]) => {
          this.changeEvent.emit({data: rows, valid: this.formGroup.valid});
        })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public onAddFieldClick(): void {
    if (!this.formRows) return;

    this.formRows.push(
      this.fb.group({
        type: this.fb.control<ListItem>({content: '', selected: false}, [
          Validators.required,
          this.typeSelectValidator,
        ]),
        label: this.fb.control<string>('', Validators.required),
        content: this.fb.control<string>('', Validators.required),
      })
    );
  }

  public onDeleteFieldClick(index: number): void {
    if (!this.formRows) return;

    this.formRows.removeAt(index);
  }

  private typeSelectValidator(control: AbstractControl): null | {[key: string]: string} {
    const controlValue: ListItem | undefined = control.value;
    if (!controlValue || !controlValue.selected) return {error: 'Type is not selected'};

    return null;
  }
}
