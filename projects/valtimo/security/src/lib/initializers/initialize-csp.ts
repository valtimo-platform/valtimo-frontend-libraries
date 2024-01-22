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

import {NGXLogger} from 'ngx-logger';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '@valtimo/config';
import {firstValueFrom} from 'rxjs';
import {BASE_NONCE, CSP_META_ID, NONCE_RESPONSE_HEADER} from '../constants';
import {DomSanitizer} from '@angular/platform-browser';
import {CSPHeaderParams, getCSP} from 'csp-header';
import {SecurityContext} from '@angular/core';
import {CspService} from '../services';

const getSanitizedCspString = (
  cspHeaderParams: CSPHeaderParams,
  domSanitizer: DomSanitizer
): string => {
  const csp = getCSP(cspHeaderParams);
  return domSanitizer.sanitize(SecurityContext.HTML, csp);
};

const replaceStringInObj = (obj: object, matchString: string, replaceValue: string) => {
  const objCopy = {...obj};

  Object.keys(objCopy).forEach(key => {
    if (Array.isArray(objCopy[key])) {
      objCopy[key] = objCopy[key].map(value =>
        value.includes(matchString) ? replaceValue : value
      );
    } else if (typeof objCopy[key] === 'object') {
      objCopy[key] = replaceStringInObj(objCopy[key], matchString, replaceValue);
    }
  });

  return objCopy;
};

const getCspHeaderElement = (
  cspHeaderParams: CSPHeaderParams,
  cspNonce: string,
  domSanitizer: DomSanitizer,
  document: Document
): HTMLMetaElement => {
  const cspHeaderParamsWithNonce = replaceStringInObj(cspHeaderParams, BASE_NONCE, `'${cspNonce}'`);
  const csp = getSanitizedCspString(cspHeaderParamsWithNonce, domSanitizer);
  const cspMeta = document.createElement('meta');

  cspMeta.httpEquiv = NONCE_RESPONSE_HEADER;
  cspMeta.content = csp;
  cspMeta.id = CSP_META_ID;

  return cspMeta;
};

const appendElementToHead = (element: HTMLMetaElement, document: Document): void => {
  document.head.appendChild(element);
};

export const initializeCsp = (
  httpClient: HttpClient,
  logger: NGXLogger,
  configService: ConfigService,
  document: Document,
  domSanitizer: DomSanitizer,
  cspService: CspService
): (() => Promise<void>) => {
  return async () => {
    const cspHeaderParams = configService?.config?.csp;

    if (cspHeaderParams) {
      const response = await firstValueFrom(
        httpClient.get(`${configService.config.valtimoApi.endpointUri}v1/ping`, {
          observe: 'response',
          responseType: 'text',
        })
      );
      const responseCspHeader = response.headers.get(NONCE_RESPONSE_HEADER);

      if (responseCspHeader) {
        const nonceString = responseCspHeader.replace(BASE_NONCE, '');
        cspService.setCspNonce(nonceString);

        logger.log('CSP nonce set on window:', responseCspHeader);

        const cspHeaderElement = getCspHeaderElement(
          cspHeaderParams,
          responseCspHeader,
          domSanitizer,
          document
        );

        appendElementToHead(cspHeaderElement, document);
      }
    }
  };
};
