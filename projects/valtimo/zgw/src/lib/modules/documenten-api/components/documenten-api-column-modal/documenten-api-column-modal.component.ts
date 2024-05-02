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
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {
  ButtonModule,
  DropdownModule,
  InputModule,
  ListItem,
  ModalModule,
  RadioModule,
} from 'carbon-components-angular';
import {Subscription, switchMap} from 'rxjs';

import {
  ConfiguredColumn,
  DocumentenApiColumnModalType,
  DocumentenApiColumnModalTypeCloseEvent,
} from '../../models';
import {DocumentenApiColumnService} from '../../services';

@Component({
  selector: 'valtimo-documenten-api-column-modal',
  templateUrl: './documenten-api-column-modal.component.html',
  styleUrls: ['./documenten-api-column-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ModalModule,
    TranslateModule,
    InputModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    RadioModule,
  ],
})
export class DocumentenApiColumnModalComponent implements OnInit, OnDestroy {
  @Input() definitionName: string;

  private _prefillColumn: ListItem[] | null;
  @Input() public set prefillColumn(value: ConfiguredColumn | undefined) {
    if (!value) {
      return;
    }

    const column = {content: value.key, selected: true, column: value};
    this.formGroup.patchValue({column});
    this.formGroup.get('column')?.disable();
    this._prefillColumn = [column];

    if (value.sortable) {
      return;
    }

    this.formGroup.get('defaultSort')?.disable();
  }
  public get prefillColumn(): ListItem[] | null {
    return this._prefillColumn;
  }

  private _type: DocumentenApiColumnModalType;
  @Input() public set type(value: DocumentenApiColumnModalType) {
    this._type = value;
    if (value === 'edit') {
      this.formGroup.get('column')?.disable;
    }
  }
  public get type(): DocumentenApiColumnModalType {
    return this._type;
  }

  private _availableColumns: ListItem[] = [];
  @Input() public set availableColumns(value: ConfiguredColumn[]) {
    if (!value) return;

    this._availableColumns = value.map((column: ConfiguredColumn) => ({
      content: column.key,
      selected: false,
      column,
    }));
  }
  public get availableColumns(): ListItem[] {
    return this._availableColumns;
  }

  private _defaultSortedColumn: ConfiguredColumn | undefined;
  @Input() public set configuredColumns(value: ConfiguredColumn[]) {
    if (!value) return;

    this._defaultSortedColumn = value.find((column: ConfiguredColumn) => !!column.defaultSort);
  }

  @Output() closeModal = new EventEmitter<DocumentenApiColumnModalTypeCloseEvent>();

  public formGroup = this.fb.group({
    column: this.fb.control(
      {content: '', selected: false, column: {} as ConfiguredColumn},
      Validators.required
    ),
    defaultSort: this.fb.control(null),
  });

  private readonly _subscriptions = new Subscription();

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly zgwDocumentenApiColumnService: DocumentenApiColumnService
  ) {}

  public ngOnInit(): void {
    this.openDisableRadioSubscription();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public onClose(refresh = false): void {
    this.formGroup.reset();
    this.formGroup.enable();
    this._prefillColumn = null;
    this.closeModal.emit(refresh ? 'closeAndRefresh' : 'close');
  }

  public updateColumn(): void {
    const columnValue: ListItem | null | undefined = this.formGroup.get('column')?.value;
    if (!columnValue || !this.definitionName) {
      return;
    }
    const column = {...columnValue.column, defaultSort: this.formGroup.get('defaultSort')?.value};

    if (
      !!this._defaultSortedColumn &&
      this._defaultSortedColumn.key !== column.key &&
      !!column.defaultSort
    ) {
      this.zgwDocumentenApiColumnService
        .updateColumn(this.definitionName, {
          ...this._defaultSortedColumn,
          defaultSort: null,
        })
        .pipe(
          switchMap(() =>
            this.zgwDocumentenApiColumnService.updateColumn(this.definitionName, column)
          )
        )
        .subscribe(() => {
          this.closeModal.emit('closeAndRefresh');
        });

      return;
    }

    this.zgwDocumentenApiColumnService.updateColumn(this.definitionName, column).subscribe(() => {
      this.closeModal.emit('closeAndRefresh');
    });
  }

  private openDisableRadioSubscription(): void {
    this._subscriptions.add(
      this.formGroup.get('column')?.valueChanges.subscribe(columnValue => {
        if (!columnValue?.column.sortable) {
          this.formGroup.get('defaultSort')?.disable();
        } else {
          this.formGroup.get('defaultSort')?.enable();
        }

        this.cd.detectChanges();
      })
    );
  }
}
