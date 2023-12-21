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
import {v4 as uuidv4} from 'uuid';
import React from 'react';
import {CheckboxChangeOutput} from '../../models';

@Component({
  selector: 'vcds-checkbox',
  exportAs: 'vcdsCheckbox',
  template: `
    <Checkbox
      #reactNode
      [id]="checkboxId"
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

  @Input() checkboxId: CheckboxProps['id'] = uuidv4();
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

  @Output() readonly changeEvent = new EventEmitter<CheckboxChangeOutput>();

  constructor(
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    renderer: Renderer2,
    ngZone: NgZone
  ) {
    super(elementRef, changeDetectorRef, renderer, {ngZone});

    this.onChangeHandler = this.onChangeHandler.bind(this);
  }

  public onChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: {
      checked: boolean;
      id: string;
    }
  ): void => {
    this.changeEvent.emit({
      event,
      id: data.id,
      checked: data.checked,
    });
  };
}
