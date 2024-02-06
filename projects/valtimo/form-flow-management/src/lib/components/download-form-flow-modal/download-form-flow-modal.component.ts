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
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'valtimo-download-form-flow-modal',
  templateUrl: './download-form-flow-modal.component.html',
  styleUrls: ['./download-form-flow-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadFormFlowModalComponent implements OnInit, OnDestroy {
  @Input() open = false;
  @Input() downloadFormFlowDefinitionKey: string;
  @Input() reset$!: Observable<null>;
  @Input() disabled: boolean;

  @Output() downloadEvent = new EventEmitter<string>();
  @Output() closeEvent = new EventEmitter<any>();

  private _resetSubscription!: Subscription;

  public ngOnInit(): void {
    this.openResetSubscription();
  }

  public ngOnDestroy(): void {
    this._resetSubscription?.unsubscribe();
  }

  public onCancel(): void {
    if (!this.disabled) {
      this.closeEvent.emit();
    }
  }

  public onConfirm(): void {
    this.downloadEvent.emit(this.downloadFormFlowDefinitionKey);
  }

  private openResetSubscription(): void {
    this._resetSubscription = this.reset$?.subscribe(() => {
      this.closeEvent.emit();
    });
  }
}
