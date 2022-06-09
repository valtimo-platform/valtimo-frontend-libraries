/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.See the License for the specific language governing permissions and limitations under the License.
 */

import {Pipe, PipeTransform} from '@angular/core';
import {combineLatest, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {PluginService} from '../../services';

@Pipe({
  name: 'pluginTranslate',
})
export class PluginTranslatePipe implements PipeTransform {
  constructor(
    private readonly translateService: TranslateService,
    private readonly pluginService: PluginService
  ) {}

  transform(translateKey: string, pluginDefinitionKey: string): Observable<string> {
    return combineLatest([
      this.pluginService.pluginSpecifications$,
      this.translateService.stream('key'),
    ]).pipe(
      map(([pluginSpecifications]) => {
        const currentLang = this.translateService.currentLang;
        const pluginSpecification = pluginSpecifications.find(
          specification => specification.pluginId === pluginDefinitionKey
        );
        const translation = pluginSpecification?.pluginTranslations[currentLang][translateKey];

        return translation || `${pluginDefinitionKey}.${translateKey}`;
      })
    );
  }
}
