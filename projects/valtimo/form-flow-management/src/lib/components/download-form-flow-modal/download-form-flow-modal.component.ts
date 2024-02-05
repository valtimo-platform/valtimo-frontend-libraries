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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {DownloadFormFlowOutput, FormFlowExport} from '../../models';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {CARBON_CONSTANTS} from '@valtimo/components';

@Component({
  selector: 'valtimo-download-form-flow-modal',
  templateUrl: './download-form-flow-modal.component.html',
  styleUrls: ['./download-form-flow-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadFormFlowModalComponent implements OnInit, OnDestroy {
  @Input() open = false;
  @Input() exportRowKeys: Array<string>;
  @Input() reset$!: Observable<null>;
  @Input() disabled: boolean;

  @Output() exportEvent = new EventEmitter<DownloadFormFlowOutput>();
  @Output() closeEvent = new EventEmitter<any>();

  public readonly selectedType$ = new BehaviorSubject<FormFlowExport | null>(null);

  private _resetSubscription!: Subscription;

  public ngOnInit(): void {
    this.openResetSubscription();
  }

  public ngOnDestroy(): void {
    this._resetSubscription?.unsubscribe();
  }

  public onCancel(): void {
    if (!this.disabled) {
      this.resetType();
      this.closeEvent.emit();
    }
  }

  public onConfirm(type: FormFlowExport): void {
    this.exportEvent.emit({type, keys: this.exportRowKeys});
  }

  public selectType(type: FormFlowExport): void {
    this.selectedType$.next(type);
  }

  private resetType(): void {
    setTimeout(() => {
      this.selectedType$.next(null);
    }, CARBON_CONSTANTS.modalAnimationMs);
  }

  private openResetSubscription(): void {
    this._resetSubscription = this.reset$?.subscribe(() => {
      this.closeEvent.emit();
      this.resetType();
    });
  }
}
