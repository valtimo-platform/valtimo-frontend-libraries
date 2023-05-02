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

import {Component} from '@angular/core';
import {FormService} from '@valtimo/form';
import {ListItem} from 'carbon-components-angular';
import {map, Observable} from 'rxjs';

@Component({
  selector: 'valtimo-select-form',
  templateUrl: './select-form.component.html',
  styleUrls: ['./select-form.component.scss'],
})
export class SelectFormComponent {
  private readonly formDefinitions$ = this.formService.getAllFormDefinitions();
  public readonly formDefinitionListItems$: Observable<Array<ListItem>> =
    this.formDefinitions$.pipe(
      map(formDefinitions =>
        formDefinitions.map(definition => ({
          content: definition.name,
          id: definition.id,
          selected: false,
        }))
      )
    );
  constructor(private readonly formService: FormService) {}

  selectFormDefinition(formDefinition: ListItem): void {
    console.log(formDefinition);
  }
}
