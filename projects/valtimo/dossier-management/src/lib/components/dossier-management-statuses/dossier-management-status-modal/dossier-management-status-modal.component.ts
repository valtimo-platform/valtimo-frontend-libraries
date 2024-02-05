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
import {StatusModalCloseEvent, StatusModalType} from '../../../models';
import {BehaviorSubject, combineLatest, map, tap} from 'rxjs';
import {CARBON_CONSTANTS} from '@valtimo/components';
import {FormBuilder, Validators} from '@angular/forms';
import {InternalDocumentStatus} from '@valtimo/document';

@Component({
  selector: 'valtimo-dossier-management-status-modal',
  templateUrl: './dossier-management-status-modal.component.html',
  styleUrls: ['./dossier-management-status-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DossierManagementStatusModalComponent {
  @Input() public set type(value: StatusModalType) {
    this._type.next(value);

    if (value === 'closed') {
      setTimeout(() => {
        this._typeAnimationDelay$.next(value);
      }, CARBON_CONSTANTS.modalAnimationMs);
    } else {
      this._typeAnimationDelay$.next(value);
    }
  }

  @Input() public set prefill(value: InternalDocumentStatus) {
    this._prefillStatus.next(value);
  }

  @Output() public closeModalEvent = new EventEmitter<StatusModalCloseEvent>();

  private readonly _type = new BehaviorSubject<StatusModalType>(undefined);
  private readonly _typeAnimationDelay$ = new BehaviorSubject<StatusModalType>(undefined);
  private readonly _prefillStatus = new BehaviorSubject<InternalDocumentStatus>(undefined);

  public readonly isClosed$ = this._type.pipe(map(type => type === 'closed'));

  public readonly statusFormGroup = this.fb.group({
    title: this.fb.control('', Validators.required),
    key: this.fb.control('', Validators.required),
    visibleInCaseListByDefault: this.fb.control(true, Validators.required),
  });

  public readonly isEdit$ = combineLatest([this._typeAnimationDelay$, this._prefillStatus]).pipe(
    tap(([type, prefillStatus]) => {
      if (type === 'edit' && prefillStatus) this.prefillForm(prefillStatus);
    }),
    map(([type]) => type === 'edit')
  );

  public readonly isAdd$ = this._typeAnimationDelay$.pipe(
    map(type => type === 'add'),
    tap(isAdd => {
      if (isAdd) this.resetForm();
    })
  );

  public get visibleInCaseListByDefault() {
    return this.statusFormGroup?.get('visibleInCaseListByDefault');
  }

  constructor(private readonly fb: FormBuilder) {}

  public onClose(): void {
    this.closeModalEvent.emit('close');
  }

  public toggleCheckedChange(checked: boolean): void {
    this.statusFormGroup.patchValue({
      visibleInCaseListByDefault: checked,
    });
  }

  private prefillForm(prefillStatus: InternalDocumentStatus): void {
    this.statusFormGroup.patchValue({
      key: prefillStatus.key,
      title: prefillStatus.title,
      visibleInCaseListByDefault: prefillStatus.visibleInCaseListByDefault,
    });
  }

  private resetForm(): void {
    this.statusFormGroup.patchValue({
      key: '',
      title: '',
      visibleInCaseListByDefault: true,
    });
  }
}
