/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
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
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {InputType} from '../../models';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'v-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit, OnChanges {
  @Input() type: InputType = 'text';
  @Input() title = '';
  @Input() titleTranslationKey = '';
  @Input() defaultValue!: any;
  @Input() widthPx!: number;
  @Input() fullWidth = false;
  @Input() margin = false;
  @Input() disabled = false;
  @Input() step!: number;
  @Input() min!: number;

  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  inputValue$ = new BehaviorSubject<any>(undefined);

  isText!: boolean;
  isNumber!: boolean;

  ngOnInit(): void {
    this.setInputType();
    this.setDefaultValue();
  }

  onValueChange(value: any): void {
    this.inputValue$.next(value);
    this.valueChange.emit(value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.defaultValue?.currentValue) {
      this.inputValue$.next(changes?.defaultValue?.currentValue);
    }
  }

  private setDefaultValue(): void {
    if (this.defaultValue) {
      this.inputValue$.next(this.defaultValue);
    }
  }

  private setInputType(): void {
    switch (this.type) {
      case 'text':
        this.isText = true;
        break;
      case 'number':
        this.isNumber = true;
        break;
    }
  }
}
