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
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {FormField} from '../formfield.model';
import {Component, Input} from '@angular/core';
import {CamundaLongFormfieldComponent} from './camunda-long-formfield.component';

describe('CamundaLongFormfieldComponent', () => {
  let component: CamundaLongFormfieldComponent;
  let fixture: ComponentFixture<CamundaLongFormfieldComponent>;

  let formGroup: UntypedFormGroup;

  @Component({selector: 'valtimo-camunda-formfield-validation', template: ''})
  class CamundaFormFieldValidationComponent {
    @Input() formField: FormField;
    @Input() formGroup: UntypedFormGroup;
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CamundaFormFieldValidationComponent, CamundaLongFormfieldComponent],
      imports: [ReactiveFormsModule, FormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CamundaLongFormfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getFormField(validationConstraints): FormField {
    return {
      businessKey: false,
      defaultValue: 'formfield1',
      id: 'formfield',
      typeName: 'string',
      label: 'formfield1',
      value: {},
      properties: {},
      validationConstraints,
    };
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create long formfield', () => {
    const formField = getFormField([]);
    formGroup = new UntypedFormBuilder().group({});
    formGroup.addControl(
      formField.id,
      new UntypedFormControl(formField.defaultValue, Validators.required)
    );

    component.formField = formField;
    component.formGroup = formGroup;
    fixture.detectChanges();

    const el = fixture.debugElement.nativeElement;
    expect(el.querySelector('label').innerText).toEqual(formField.label);
    expect(el.querySelector('input')).toBeTruthy();
    expect(el.querySelector('input').id).toEqual(formField.id);
    expect(el.querySelector('input').getAttribute('type')).toEqual('number');
  });
});
