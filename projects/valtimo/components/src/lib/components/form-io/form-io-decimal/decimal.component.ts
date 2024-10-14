import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {FormioCustomComponent} from '../../../modules';
import {decimalValidator} from './decimal.validators';

/**
 * Custom formio component for decimal number.
 */
@Component({
  selector: 'valtimo-decimal',
  templateUrl: './decimal.component.html',
  styleUrls: ['./decimal.component.scss'],
})
export class FormIoDecimalComponent
  implements FormioCustomComponent<any>, AfterViewInit, OnDestroy
{
  @Input() public value: string;
  @Input() public disabled = false;
  @Input() public required = false;
  @Output() public valueChange = new EventEmitter<any>();
  public decimalForm = new FormGroup({
    decimal: new FormControl(''),
  });
  private readonly _subscriptions = new Subscription();

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.decimalForm.controls.decimal.setValue(this.value);
      this.decimalForm.controls.decimal.setValidators(
        this.required ? [Validators.required, decimalValidator()] : [decimalValidator()]
      );
      this.decimalForm.controls.decimal.updateValueAndValidity();

      if (this.disabled) {
        Object.keys(this.decimalForm.controls).forEach(key => {
          this.decimalForm?.get(key)?.disable();
        });
      }

      this._subscriptions.add(
        this.decimalForm.valueChanges.subscribe(() => {
          this.onValueChange();
        })
      );
    });
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private onValueChange(): void {
    (this.value as any) = this.decimalForm.valid
      ? this.decimalForm.controls.decimal.value
      : [this.decimalForm.value];
    this.valueChange.emit(this.value);
  }
}
