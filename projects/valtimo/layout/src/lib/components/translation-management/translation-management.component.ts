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

import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'valtimo-translation-management',
  templateUrl: './translation-management.component.html',
  styleUrls: ['./translation-management.component.scss'],
})
export class TranslationManagementComponent implements OnInit {
  private readonly _languageOptions$ = new BehaviorSubject<Array<string>>(undefined);

  constructor(private readonly translateService: TranslateService) {}

  public ngOnInit(): void {
    this.setLanguages();
  }

  private setLanguages(): void {
    this._languageOptions$.next(this.translateService.langs);
    console.log(this._languageOptions$.getValue());
  }
}
