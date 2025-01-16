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

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormCustomComponent} from '@valtimo/process-link';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-custom-angular-form',
  templateUrl: './custom-angular-form-example.component.html',
  styleUrls: ['./custom-angular-form-example.component.scss'],
  standalone: true
})
export class CustomAngularFormExampleComponent implements FormCustomComponent {
  @Input() set processDefinitionKey(processDefinitionKey: string) {
    this.processDefinitionKey$.next(processDefinitionKey);
  }
  @Input() set taskInstanceId(taskInstanceId: string) {
    this.taskInstanceId$.next(taskInstanceId);
  }
  @Input() set documentDefinitionName(documentDefinitionName: string) {
    this.documentDefinitionName$.next(documentDefinitionName);
  }
  @Output() submitEvent = new EventEmitter<any>;

  public readonly taskInstanceId$ = new BehaviorSubject<string>(undefined);
  public readonly processDefinitionKey$ = new BehaviorSubject<string>(undefined);
  public readonly documentDefinitionName$ = new BehaviorSubject<string>(undefined);


  constructor() {}
}
