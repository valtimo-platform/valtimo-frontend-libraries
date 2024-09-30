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
import {TrashCan16} from '@carbon/icons';
import {TranslateModule} from '@ngx-translate/core';
import {
  ButtonModule,
  DropdownModule,
  IconModule,
  IconService,
  InputModule,
  ListItem,
} from 'carbon-components-angular';
import {debounceTime, Subscription} from 'rxjs';
import {LoggingEventSearchFormValue, LoggingEventSearchRequest, LogLevel} from '../../models';

@Component({
  selector: 'valtimo-log-search',
  templateUrl: './log-search.component.html',
  styleUrl: './log-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    DropdownModule,
    IconModule,
    InputModule,
    ReactiveFormsModule,
  ],
})
export class LogSearchComponent implements OnInit, OnDestroy {
  @Input() public set initSearchRequest(value: LoggingEventSearchRequest) {
    const mappedFormValue = this.mapSearchRequestToFormValue(value);
    if (!!mappedFormValue.level)
      this.logLevelItems = this.logLevelItems.map((levelItem: ListItem) => ({
        ...levelItem,
        selected: mappedFormValue.level?.content === levelItem.content,
      }));
    this.formGroup.patchValue(mappedFormValue, {emitEvent: false});
  }
  @Output() public readonly searchSubmitEvent = new EventEmitter<LoggingEventSearchRequest>();

  public readonly formGroup = this.fb.group({
    likeFormattedMessage: this.fb.control<string>(''),
    level: this.fb.control<ListItem>({content: '', selected: false}),
  });

  public logLevelItems: ListItem[] = [
    {
      content: LogLevel.DEBUG,
      selected: false,
    },
    {
      content: LogLevel.ERROR,
      selected: false,
    },
    {
      content: LogLevel.INFO,
      selected: false,
    },
    {
      content: LogLevel.TRACE,
      selected: false,
    },
    {
      content: LogLevel.WARN,
      selected: false,
    },
  ];

  private readonly _subscriptions = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly iconService: IconService
  ) {
    this.iconService.register(TrashCan16);
  }

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

  public onClearFilter(): void {
    this.formGroup.reset();
  }

  private mapFormValueToLogSearch(): LoggingEventSearchRequest {
    const formValue = this.formGroup.getRawValue();

    return {
      ...(formValue.likeFormattedMessage && {likeFormattedMessage: formValue.likeFormattedMessage}),
      ...(formValue.level?.content && {level: formValue.level.content}),
    };
  }

  private mapSearchRequestToFormValue(
    searchRequest: LoggingEventSearchRequest
  ): LoggingEventSearchFormValue {
    return {
      ...(searchRequest.likeFormattedMessage && {
        likeFormattedMessage: searchRequest.likeFormattedMessage,
      }),
      ...(searchRequest.level && {
        level: {
          content: searchRequest.level,
          selected: true,
        },
      }),
    };
  }
}
