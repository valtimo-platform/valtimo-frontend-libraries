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

@Component({
  selector: 'vcds-heading',
  exportAs: 'vcdsHeading',
  template: `
    <Heading [className]="className" #reactNode>
      <ReactContent><ng-content></ng-content></ReactContent>
    </Heading>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VcdsHeadingComponent extends ReactWrapperComponent<{}> {
  @ViewChild('reactNode', {static: true}) protected reactNodeRef: ElementRef;

  @Input() className!: string;

  constructor(
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    renderer: Renderer2,
    ngZone: NgZone
  ) {
    super(elementRef, changeDetectorRef, renderer, {ngZone});
  }
}
