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

import {CSPHeaderParams, DATA, SELF} from 'csp-header';
import {UrlUtils} from '@valtimo/config';
import {authenticationKeycloak} from '../auth/keycloak-config.test';
import {NONCE} from '@valtimo/security';

export const cspHeaderParamsTest: CSPHeaderParams = {
  directives: {
    'default-src': [SELF],
    // DATA is needed because of use of inline images
    'img-src': [SELF, DATA],
    // UNSAFE_EVAL is needed because of javascript in form.io forms (i.e. on summary page)
    'script-src': [SELF, NONCE],
    // DATA is needed because of use of inline fonts
    'font-src': [
      SELF,
      DATA,
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/',
      'https://fonts.gstatic.com',
    ],
    'connect-src': [
      SELF,
      UrlUtils.getUrlHost(authenticationKeycloak.options.keycloakOptions.config.url),
    ],
    // UNSAFE_INLINE is needed because of use of inline styles
    'style-src': [
      SELF,
      NONCE,
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/',
      'https://fonts.googleapis.com',
    ],
  },
};
