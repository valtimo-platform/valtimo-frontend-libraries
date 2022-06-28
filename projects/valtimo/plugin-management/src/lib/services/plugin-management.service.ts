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

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {combineLatest, Observable, of} from 'rxjs';
import {
  PluginConfiguration,
  PluginConfigurationWithLogo,
  PluginDefinition,
  PluginFunction,
} from '../models';
import {ConfigService} from '@valtimo/config';
import {delay, map} from 'rxjs/operators';
import {PluginService} from '@valtimo/plugin';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class PluginManagementService {
  private readonly CONFIGURATIONS = [
    {
      definitionKey: 'openzaak',
      key: '1ebdad87-3899-4ab7-b4ad-403237b17dbd',
      title: 'Den Haag Open Zaak 1',
    },
    {
      definitionKey: 'openzaak',
      key: '1ebdad87-3899-4ab7-b4ad-403237b17dbe',
      title: 'Den Haag Open Zaak 2',
    },
    {
      definitionKey: 'smartdocuments',
      key: '1ebdad87-3899-4ab7-b4ad-403237b17dbx',
      title: 'Den Haag SmartDocuments 1',
    },
    {
      definitionKey: 'smartdocuments',
      key: '1ebdad87-3899-4ab7-b4ad-403237b17dby',
      title: 'Den Haag SmartDocuments 2',
    },
  ];

  constructor(
    private readonly pluginService: PluginService,
    private readonly sanitizer: DomSanitizer
  ) {}

  getPluginDefinitions(): Observable<Array<PluginDefinition>> {
    return of([{key: 'openzaak'}, {key: 'smartdocuments'}]).pipe(delay(1500));
  }

  getPluginConfigurations(pluginDefinitionId: string): Observable<Array<PluginConfiguration>> {
    return of(this.CONFIGURATIONS).pipe(delay(1500));
  }

  getPluginConfigurationsWithLogos(
    pluginDefinitionId: string
  ): Observable<Array<PluginConfiguration>> {
    return this.returnPluginConfigurationsWithLogos(
      this.getPluginConfigurations(pluginDefinitionId)
    );
  }

  getPluginFunctions(pluginDefinitionId: string): Observable<Array<PluginFunction>> {
    return of(
      pluginDefinitionId === 'openzaak'
        ? [
            {
              key: 'create-zaak',
            },
            {
              key: 'set-status',
            },
            {
              key: 'set-resultaat',
            },
            {
              key: 'set-besluit',
            },
          ]
        : [{key: 'generate-document'}]
    ).pipe(delay(1500));
  }

  getAllPluginConfigurations(): Observable<Array<PluginConfiguration>> {
    return of(this.CONFIGURATIONS).pipe(delay(1500));
  }

  getAllPluginConfigurationsWithLogos(): Observable<Array<PluginConfiguration>> {
    return this.returnPluginConfigurationsWithLogos(this.getAllPluginConfigurations());
  }

  private returnPluginConfigurationsWithLogos(
    pluginConfigurations$: Observable<Array<PluginConfiguration>>
  ): Observable<Array<PluginConfigurationWithLogo>> {
    return combineLatest([pluginConfigurations$, this.pluginService.pluginSpecifications$]).pipe(
      map(([pluginConfigurations, pluginSpecifications]) =>
        pluginConfigurations?.map(pluginConfiguration => {
          const pluginSpecification = pluginSpecifications.find(
            specification => specification.pluginId === pluginConfiguration.definitionKey
          );

          return {
            ...pluginConfiguration,
            ...(pluginSpecification?.pluginLogoBase64 && {
              pluginLogoBase64: this.sanitizer.bypassSecurityTrustResourceUrl(
                pluginSpecification?.pluginLogoBase64
              ),
            }),
          };
        })
      )
    );
  }
}
