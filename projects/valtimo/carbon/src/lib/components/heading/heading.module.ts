// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {registerElement} from '@valtimo/angular-react';
import {CommonModule} from '@angular/common';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {Heading} from '@carbon/react';
import {VcdsHeadingComponent} from './heading.component';

const components = [VcdsHeadingComponent];

@NgModule({
  imports: [CommonModule],
  declarations: components,
  exports: components,
  schemas: [NO_ERRORS_SCHEMA],
})
export class VcdsHeadingModule {
  constructor() {
    // Add any React elements to the registry (used by the renderer).
    registerElement('Heading', () => Heading);
  }
}
