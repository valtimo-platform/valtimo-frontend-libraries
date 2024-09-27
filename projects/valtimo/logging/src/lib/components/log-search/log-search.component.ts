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
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ButtonModule, InputModule} from 'carbon-components-angular';
import {LoggingEventSearchRequest} from '../../models';
import {Subscription, debounceTime} from 'rxjs';

@Component({
  selector: 'valtimo-log-search',
  templateUrl: './log-search.component.html',
  styleUrl: './log-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonModule, InputModule, ReactiveFormsModule],
})
export class LogSearchComponent implements OnInit, OnDestroy {
  @Input() public set initSearchRequest(value: LoggingEventSearchRequest) {
    this.formGroup.patchValue(this.mapSearchRequestToFormValue(value), {emitEvent: false});
  }
  @Output() public readonly searchSubmitEvent = new EventEmitter<LoggingEventSearchRequest>();

  public readonly formGroup = this.fb.group({
    likeFormattedMessage: this.fb.control<string>(''),
  });

  private readonly _subscriptions = new Subscription();
  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this._subscriptions.add(
      this.formGroup.valueChanges.pipe(debounceTime(500)).subscribe(() => {
        this.searchSubmitEvent.emit(this.mapFormValueToLogSearch());
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private mapFormValueToLogSearch(): LoggingEventSearchRequest {
    const formValue = this.formGroup.getRawValue();

    return {
      ...(formValue.likeFormattedMessage && {likeFormattedMessage: formValue.likeFormattedMessage}),
    };
  }

  private mapSearchRequestToFormValue(searchRequest: LoggingEventSearchRequest): any {
    return {
      ...(searchRequest.likeFormattedMessage && {
        likeFormattedMessage: searchRequest.likeFormattedMessage,
      }),
    };
  }
}
