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

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {StatusModalCloseEvent, StatusModalType} from '../../../models';
import {BehaviorSubject, combineLatest, map, Subscription, tap} from 'rxjs';
import {CARBON_CONSTANTS} from '@valtimo/components';
import {FormBuilder, Validators} from '@angular/forms';
import {InternalDocumentStatus} from '@valtimo/document';
import {IconService} from 'carbon-components-angular';
import {Edit16} from '@carbon/icons';

@Component({
  selector: 'valtimo-dossier-management-status-modal',
  templateUrl: './dossier-management-status-modal.component.html',
  styleUrls: ['./dossier-management-status-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DossierManagementStatusModalComponent implements OnInit, OnDestroy {
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

  @Input() public usedKeys!: string[];

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

  public get key() {
    return this.statusFormGroup?.get('key');
  }

  public get title() {
    return this.statusFormGroup?.get('title');
  }

  public get invalid(): boolean {
    return !!this.statusFormGroup?.invalid;
  }

  public get pristine(): boolean {
    return !!this.statusFormGroup?.pristine;
  }

  private readonly _editingKey$ = new BehaviorSubject<boolean>(false);

  public readonly editingKey$ = this._editingKey$.pipe(
    tap(editing => {
      if (editing) {
        this.key?.enable();
      } else {
        this.key?.disable();
      }
    })
  );

  private readonly _subscriptions = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly iconService: IconService
  ) {
    this.iconService.registerAll([Edit16]);
  }

  public ngOnInit(): void {
    this.openAutoKeySubscription();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public onClose(): void {
    this.closeModalEvent.emit('close');
  }

  public toggleCheckedChange(checked: boolean): void {
    this.statusFormGroup.patchValue({
      visibleInCaseListByDefault: checked,
    });
  }

  public addStatus(): void {
    console.log('add');
  }

  public editStatus(): void {
    console.log('edit');
  }

  public editKeyButtonClick(): void {
    this._editingKey$.next(true);
  }

  private prefillForm(prefillStatus: InternalDocumentStatus): void {
    this.statusFormGroup.patchValue({
      key: prefillStatus.key,
      title: prefillStatus.title,
      visibleInCaseListByDefault: prefillStatus.visibleInCaseListByDefault,
    });
    this.statusFormGroup.markAsPristine();
    this.resetEditingKey();
  }

  private resetForm(): void {
    this.statusFormGroup.patchValue({
      key: '',
      title: '',
      visibleInCaseListByDefault: true,
    });
    this.statusFormGroup.markAsPristine();
    this.resetEditingKey();
  }

  private resetEditingKey(): void {
    this._editingKey$.next(false);
  }

  private openAutoKeySubscription(): void {
    this._subscriptions.add(
      combineLatest([this.isAdd$, this.title.valueChanges, this.editingKey$]).subscribe(
        ([isAdd, titleValue, editingKey]) => {
          if (isAdd && !editingKey) {
            if (titleValue) {
              this.statusFormGroup.patchValue({key: this.getUniqueKey(titleValue)});
            } else {
              this.clearKey();
            }
          }
        }
      )
    );
  }

  private getUniqueKey(title: string): string {
    const dashCaseTitle = `${title}`.toLowerCase().replace(/\s+/g, '-');
    const usedKeys = this.usedKeys;

    if (!usedKeys.includes(dashCaseTitle)) {
      return dashCaseTitle;
    } else {
      return this.getUniqueKeyWithNumber(dashCaseTitle, usedKeys);
    }
  }

  private getUniqueKeyWithNumber(dashCaseKey: string, usedKeys: string[]): string {
    const numbersFromCurrentKey = (dashCaseKey.match(/^\d+|\d+\b|\d+(?=\w)/g) || []).map(
      (numberValue: string) => +numberValue
    );
    const lastNumberFromCurrentKey =
      numbersFromCurrentKey.length > 0 && numbersFromCurrentKey[numbersFromCurrentKey.length - 1];
    const newKey = lastNumberFromCurrentKey
      ? `${dashCaseKey.replace(`${lastNumberFromCurrentKey}`, `${lastNumberFromCurrentKey + 1}`)}`
      : `${dashCaseKey}-1`;

    if (usedKeys.includes(newKey)) {
      return this.getUniqueKeyWithNumber(newKey, usedKeys);
    }

    return newKey;
  }

  private clearKey(): void {
    this.statusFormGroup.patchValue({key: ''});
  }
}
