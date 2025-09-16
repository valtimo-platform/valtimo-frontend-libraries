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
import {Component, EventEmitter, OnInit, Input, Output} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {
  ButtonModule,
  IconModule, IconService,
  InputModule,
  ModalModule,
  TooltipModule,
} from 'carbon-components-angular';
import {FormGroup, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {Edit16} from '@carbon/icons';
import {BasicCaseWidget, CaseWidget, CaseWidgetType} from '@valtimo/case';
import {tap} from 'rxjs/operators';
import {AbstractControl} from '@angular/forms';
import {ModalMode} from '../../../../../../models/widget-divider.model';
import {CARBON_CONSTANTS} from '@valtimo/components';

@Component({
  selector: 'valtimo-case-management-divider-modal',
  templateUrl: './case-management-divider-modal.component.html',
  styleUrls: ['./case-management-divider-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ModalModule,
    ButtonModule,
    IconModule,
    InputModule,
    TooltipModule,
    ReactiveFormsModule
  ],
})
export class CaseManagementDividerModalComponent implements OnInit{
  @Input() public open = false;

  @Input() public mode: ModalMode;

  private _prefillData: CaseWidget | null;
  @Input() public set prefillData(value: CaseWidget | null) {
    this._prefillData = value;
    this.setPrefilledForm(value);
  }

  public get prefillData(): CaseWidget | null {
    return this._prefillData;
  }

  @Output() public closeEvent = new EventEmitter<BasicCaseWidget | null>();

  public get buttonLabel(): string {
    switch (this.mode) {
      case 'create':
        return 'widgetTabManagement.list.dividerModal.create';
      case 'edit':
        return 'widgetTabManagement.list.dividerModal.edit';
      case 'duplicate':
        return 'widgetTabManagement.list.dividerModal.duplicate';
      default:
        return 'widgetTabManagement.list.dividerModal.create';
    }
  }

  public dividerForm: FormGroup;

  public readonly editDisabled$ = new BehaviorSubject<boolean>(true);

  private readonly _editActive$ = new BehaviorSubject<boolean>(false);
  public readonly editActive$ = this._editActive$.pipe(
    tap((editActive: boolean) => {
      const key: AbstractControl | null = this.dividerForm.get('key');
      if (!key) {
        return;
      }

      if (editActive) {
        key.enable();
        return;
      }
      key.disable();
    })
  );

  public readonly idError$ = new BehaviorSubject<string | null>(null);

  public divider: BasicCaseWidget = {
    "type": CaseWidgetType.DIVIDER,
    "title": '',
    "width": 4,
    "highContrast": false,
    "key": '',
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly iconService: IconService
  ) {
    this.iconService.registerAll([Edit16]);
  }

  public ngOnInit(): void {
    this.dividerForm = this.fb.group({
      title: this.fb.control<string>(''),
      key: this.fb.control<string>('', [
        Validators.required,
        Validators.pattern('[A-Za-z0-9-]*'),
      ]),
    });

    this.getDefaultKey();
  }

  public onCloseModal(dividerCreated?: boolean): void {
    if(!dividerCreated) {
      this.closeEvent.emit(null);
      this.editDisabled$.next(false);
      this.resetForm();
      return;
    }

    const {title, key} = this.dividerForm.controls;
    if (!title || !key) {
      return;
    }

    this.divider.title = title.value;
    this.divider.key = key.value;

    this.closeEvent.emit(this.divider);
    this.dividerForm.reset();
  }

  public enableEdit(): void {
    this._editActive$.next(true);
  }

  public onFocusOut(): void {
    const {title, key} = this.dividerForm.controls;
    if (!title || !key) {
      return;
    }

    if (this.mode !== 'edit') {
      this.editDisabled$.next(false);
      key.patchValue(title?.value.replace(/\W+/g, '-').replace(/\-$/, '').toLowerCase());
    }
  }

  public getDefaultKey(): void {
    console.log('getDefaultKey');
    this.dividerForm.patchValue({ key: 'widget-divider' });
  }

  private resetForm(): void {
    setTimeout(() => {
      this.dividerForm.reset();
      this.idError$.next(null);
      this._editActive$.next(false);
      this.editDisabled$.next(true);
    }, CARBON_CONSTANTS.modalAnimationMs);
  }

  private setPrefilledForm(prefillData: CaseWidget | null): void {
    if (!prefillData) return;

    let title = prefillData.title;
    let key = prefillData.key;

    if (this.mode === 'duplicate') {
      title = `${prefillData.title}-duplicate`;
      key = `${prefillData.key}-duplicate`;
      this.editDisabled$.next(false);
    }

    this.dividerForm.patchValue({
      ...prefillData,
      title,
      key
    });

    this.enableEdit();
  }
}
