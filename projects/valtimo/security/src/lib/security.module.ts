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

import {NgModule} from '@angular/core';
import {ErrorComponent} from './error/error.component';
import {ErrorRoutingModule} from './error/error-routing.module';
import {AuthGuardService} from './guard/auth-guard.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {ZoneOffsetInterceptor} from './interceptors';

@NgModule({
  declarations: [ErrorComponent],
  imports: [ErrorRoutingModule],
  exports: [ErrorComponent],
  providers: [
    AuthGuardService,
    {provide: HTTP_INTERCEPTORS, useClass: ZoneOffsetInterceptor, multi: true},
  ],
})
export class SecurityModule {}
