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

import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ChoicefieldService} from './choicefield.service';

describe('ChoicefieldService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [ChoicefieldService],
      imports: [HttpClientTestingModule],
    })
  );

  it('should be created', () => {
    const service: ChoicefieldService = TestBed.inject(ChoicefieldService);
    expect(service).toBeTruthy();
  });
});
