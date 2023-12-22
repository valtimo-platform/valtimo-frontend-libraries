// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {ReactWrapperComponent} from '@valtimo/angular-react';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {TileProps} from '@carbon/react';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'vcds-tile',
  exportAs: 'vcdsTile',
  template: `
    <Tile [id]="tileId" #reactNode>
      <ReactContent><ng-content></ng-content></ReactContent>
    </Tile>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VcdsTileComponent extends ReactWrapperComponent<TileProps> {
  @ViewChild('reactNode', {static: true}) protected reactNodeRef: ElementRef;

  @Input() tileId: TileProps['id'] = uuidv4();

  constructor(
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    renderer: Renderer2,
    ngZone: NgZone
  ) {
    super(elementRef, changeDetectorRef, renderer, {ngZone});
  }
}
