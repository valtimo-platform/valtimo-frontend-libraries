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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {InputType} from '../../models';

@Component({
  selector: 'v-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit {
  @Input() type: InputType = 'text';

  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  isText!: boolean;

  ngOnInit(): void {
    this.setInputType();
  }

  onValueChange(value: any): void {
    this.valueChange.emit(value);
  }

  private setInputType(): void {
    switch (this.type) {
      case 'text':
        this.isText = true;
        break;
    }
  }
}
