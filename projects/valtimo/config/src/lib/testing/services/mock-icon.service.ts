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
<<<<<<<< HEAD:projects/valtimo/config/src/lib/testing/services/mock-icon.service.ts
========
import {Observable, of} from 'rxjs';
>>>>>>>> release/11.0.0:projects/valtimo/config/src/lib/testing/services/mock-translate.service.ts

@Injectable({
  providedIn: 'root',
})
<<<<<<<< HEAD:projects/valtimo/config/src/lib/testing/services/mock-icon.service.ts
export class MockIconService {
  public registerAll(value: Array<any>): void {
    return;
========
export class MockTranslateService {
  public stream(key: string): Observable<any> {
    return of(null);
>>>>>>>> release/11.0.0:projects/valtimo/config/src/lib/testing/services/mock-translate.service.ts
  }
}
