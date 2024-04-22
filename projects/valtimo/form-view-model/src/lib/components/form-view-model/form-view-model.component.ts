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
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {
  FormioModule
} from '@formio/angular';
import {CommonModule} from '@angular/common';
moment.defaultFormat = 'DD MMM YYYY HH:mm';

@Component({
  selector: 'valtimo-form-view-model',
  templateUrl: './form-view-model.component.html',
  styleUrls: ['./form-view-model.component.css'],
  standalone: true,
  imports: [CommonModule, FormioModule]
})
export class FormViewModelComponent implements OnInit {

  public readonly disabled$ = new BehaviorSubject<boolean>(false);

  constructor(
  ) {}

  ngOnInit() {
  }

  public onChange(event: any): void {
    if (event?.data) {
    }
  }
}
