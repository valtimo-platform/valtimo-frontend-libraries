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

import {Injectable} from '@angular/core';
import {GlobalSettings} from '../models';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from './config.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GlobalSettingsService {
  private readonly valtimoApiUri!: string;

  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigService
  ) {
    this.valtimoApiUri = configService?.config?.valtimoApi?.endpointUri;
  }

  getGlobalSettings(): Observable<GlobalSettings> {
    return this.http.get<GlobalSettings>(`${this.valtimoApiUri}v1/settings`);
  }

  getGlobalSettingsTranslationsByLangKey(languageKey: string): Observable<object> {
    return this.getGlobalSettings().pipe(
      map(globalSettings => {
        const translations = globalSettings?.translations;
        const translationsForLang = translations && translations[languageKey];

        return translationsForLang || {};
      })
    );
  }
}
