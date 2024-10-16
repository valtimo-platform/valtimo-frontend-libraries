/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {PageTitleComponent} from './page-title.component';
import {TranslateService} from '@ngx-translate/core';
import {MockTranslateService, VALTIMO_CONFIG} from '@valtimo/config';
import {LoggerTestingModule} from 'ngx-logger/testing';
import {environment} from '@src/environments/environment';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';

describe('PageTitleComponent', () => {
  let component: PageTitleComponent;
  let fixture: ComponentFixture<PageTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, LoggerTestingModule],
      declarations: [PageTitleComponent],
      providers: [
        {provide: TranslateService, useClass: MockTranslateService},
        {provide: VALTIMO_CONFIG, useValue: environment},
        {
          provide: ActivatedRoute,
          useValue: {
            firstChild: {
              data: of({id: ''}),
            },
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Valtimo as appTitle', () => {
    expect(component.appTitle).toEqual('Valtimo');
  });
});
