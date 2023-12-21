// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {ReactWrapperComponent} from '@valtimo/angular-react';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {CheckboxProps} from '@carbon/react';

@Component({
  selector: 'vcds-checkbox',
  exportAs: 'vcdsCheckbox',
  template: `
    <Checkbox
      #reactNode
      [id]="id"
      [labelText]="labelText"
      [disabled]="disabled"
      [checked]="checked"
      [invalid]="invalid"
      [hideLabel]="hideLabel"
      [helperText]="helperText"
      [defaultChecked]="defaultChecked"
      [indeterminate]="indeterminate"
      [readOnly]="readOnly"
      [warn]="warn"
      [warnText]="warnText"
      [title]="title"
      [slug]="slug"
      [className]="className"
      [Change]="onChangeHandler"
    >
    </Checkbox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VcdsCheckboxComponent extends ReactWrapperComponent<CheckboxProps> {
  @ViewChild('reactNode', {static: true}) protected reactNodeRef: ElementRef;

  @Input({required: true}) id: CheckboxProps['id'];
  @Input({required: true}) labelText: CheckboxProps['labelText'];
  @Input() disabled?: CheckboxProps['disabled'];
  @Input() checked: CheckboxProps['checked'];
  @Input() hideLabel: CheckboxProps['hideLabel'];
  @Input() defaultChecked: CheckboxProps['defaultChecked'];
  @Input() indeterminate: CheckboxProps['indeterminate'];
  @Input() helperText: CheckboxProps['helperText'];
  @Input() warnText: CheckboxProps['warnText'];
  @Input() className: CheckboxProps['className'];
  @Input() title: CheckboxProps['title'];
  @Input() slug: CheckboxProps['slug'];
  @Input() invalid: CheckboxProps['invalid'];
  @Input() readOnly: CheckboxProps['readOnly'];
  @Input() warn: CheckboxProps['warn'];

  @Output() readonly change = new EventEmitter<any>();

  constructor(
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    renderer: Renderer2,
    ngZone: NgZone
  ) {
    super(elementRef, changeDetectorRef, renderer, {ngZone});

    this.onChangeHandler = this.onChangeHandler.bind(this);
  }

  public onChangeHandler = (x: any): void => {
    console.log('on change handler');
    this.change.emit(x);
  };
}
