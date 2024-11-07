import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {FormioCustomComponent} from '../../../modules';

/**
 * Custom formio component for currency number.
 */
@Component({
  selector: 'valtimo-currency',
  templateUrl: './currency.component.html',
})
export class FormIoCurrencyComponent
  implements FormioCustomComponent<any>, AfterViewInit, OnDestroy
{
  @Input() public value: string;
  @Input() public disabled = false;
  @Input() currencySymbol: string;

  @Output() public valueChange = new EventEmitter<any>();
  public currencyForm = new FormGroup({
    currencySymbol: new FormControl(''),
    currency: new FormControl(''),
  });
  private readonly _subscriptions = new Subscription();

  public ngAfterViewInit(): void {
    console.log('this.currencyForm.controls: ', this.currencyForm.controls.currency.value);
    console.log('value: ', this.value);

    //console.log('Currency: ', this.currency);
    console.log('Currency symbol: ', this.currencySymbol);

    this.currencyForm.controls.currency.setValue(this.value);
    //this.currencyForm.controls.currency.setValidators(
    //  this.required ? [Validators.required, currencyValidator()] : [currencyValidator()]
    //);
    this.currencyForm.controls.currency.updateValueAndValidity();

    this.currencyForm.controls.currencySymbol.setValue(this.value);
    //this.currencyForm.controls.currencySymbol.setValidators(
    //  this.required ? [Validators.required, currencyValidator()] : [currencyValidator()]
    //);
    this.currencyForm.controls.currencySymbol.updateValueAndValidity();

    if (this.disabled) {
      Object.keys(this.currencyForm.controls).forEach(key => {
        this.currencyForm?.get(key)?.disable();
      });
    }

    this._subscriptions.add(
      this.currencyForm.valueChanges.subscribe(() => {
        this.onValueChange();
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private onValueChange(): void {
    console.log('Value changes: ', this.currencyForm.value);
    (this.value as any) = this.currencyForm.valid
      ? this.currencyForm.controls.currency.value
      : this.currencyForm.value;
    this.valueChange.emit(this.value);
  }
}
