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

import {HttpClient} from '@angular/common/http';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {ConfigService} from '../services/config.service';

export function MultiTranslateHttpLoaderFactory(http: HttpClient, configService: ConfigService) {
  const translationResources = configService.config.translationResources;

  return new MultiTranslateHttpLoader(http, [
    {prefix: './valtimo-translation/core/', suffix: '.json'},
    ...(translationResources &&
    Array.isArray(translationResources) &&
    translationResources.length > 0
      ? translationResources
      : []),
  ]);
}
