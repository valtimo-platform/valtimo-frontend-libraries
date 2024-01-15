// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {registerElement} from '@valtimo/angular-react';
import {CommonModule} from '@angular/common';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {Tile} from '@carbon/react';
import {VcdsTileComponent} from './tile.component';

const components = [VcdsTileComponent];

@NgModule({
  imports: [CommonModule],
  declarations: components,
  exports: components,
  schemas: [NO_ERRORS_SCHEMA],
})
export class VcdsTileModule {
  constructor() {
    // Add any React elements to the registry (used by the renderer).
    registerElement('Tile', () => Tile);
  }
}
