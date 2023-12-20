// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {InputRendererOptions, JsxRenderFunc, ReactWrapperComponent} from '@valtimo/angular-react';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {CheckboxProps} from '@carbon/react';
import {FormEvent} from 'react';

@Component({
  selector: 'vcds-checkbox',
  exportAs: 'vcdsCheckbox',
  template: `
    <Checkbox
      #reactNode
      [id]="id"
      [labelText]="labelText"
      [disabled]="disabled"
      [RenderLabel]="renderLabel && onRenderLabel"
      [Change]="onChangeHandler"
    >
    </Checkbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VcdsCheckboxComponent extends ReactWrapperComponent<CheckboxProps> implements OnInit {
  @ViewChild('reactNode', {static: true}) protected reactNodeRef: ElementRef;

  @Input({required: true}) id: CheckboxProps['id'];
  @Input({required: true}) labelText: CheckboxProps['labelText'];
  @Input() disabled?: CheckboxProps['disabled'];
  @Input() renderLabel?: InputRendererOptions<CheckboxProps>;

  @Output() readonly onChange = new EventEmitter<{ev?: Event; checked?: boolean}>();

  /* Non-React props, more native support for Angular */
  // support for two-way data binding for `@Input() checked`.
  @Output() readonly checkedChange = new EventEmitter<boolean>();

  onRenderLabel: (
    props?: CheckboxProps,
    defaultRender?: JsxRenderFunc<CheckboxProps>
  ) => JSX.Element;

  constructor(
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    renderer: Renderer2,
    ngZone: NgZone
  ) {
    super(elementRef, changeDetectorRef, renderer, {ngZone});

    // coming from React context - we need to bind to this so we can access the Angular Component properties
    this.onChangeHandler = this.onChangeHandler.bind(this);
  }

  ngOnInit() {
    this.onRenderLabel = this.createRenderPropHandler(this.renderLabel);
  }

  onChangeHandler(ev?: FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) {
    this.onChange.emit({
      ev: ev && ev.nativeEvent,
      checked,
    });

    this.checkedChange.emit(checked);
  }
}
