import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {ibanValidator} from '../form-io-iban/iban.validators';

@Component({
  selector: 'valtimo-decimal',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, TranslateModule],
  templateUrl: './decimal.component.html',
  styleUrl: './decimal.component.css',
})
export class FormIoDecimalComponent {
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
        this.required ? [Validators.required, ibanValidator()] : [ibanValidator()]
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
