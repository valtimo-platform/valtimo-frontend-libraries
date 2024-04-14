import {Component, EventEmitter, Input, Output} from '@angular/core';
import { FormioCustomComponent } from '@formio/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'valtimo-form-io-adress',
  template: `
    <div class="custom-form-io-component address-container" [formGroup]="addressForm">
      <div class="address-row">
        <cds-label for="street" class="street">
          {{ 'custom-form-io-components.form-io-address.street' | translate }}:
          <div class="input-group">
            <input cdsText id="street" type="text" formControlName="street">
            <div class="validation-message" *ngIf="this.required && addressForm.controls.street.invalid && addressForm.controls.street.touched">{{ 'custom-form-io-components.form-io-address.street' | translate }} {{ 'custom-form-io-components.isRequired' | translate }}</div>
          </div>
        </cds-label>

        <cds-label for="houseNumber" class="input-small">
          {{ 'custom-form-io-components.form-io-address.house-number' | translate }}:
          <div class="input-group">
            <input cdsText id="houseNumber" type="number" formControlName="houseNumber">
            <div class="validation-message" *ngIf="this.required && addressForm.controls.houseNumber.invalid && this.addressForm.get('houseNumber').value === null && addressForm.controls.houseNumber.touched">{{ 'custom-form-io-components.form-io-address.house-number' | translate }} {{ 'custom-form-io-components.isRequired' | translate }}</div>
            <div class="validation-message" *ngIf="this.required && addressForm.controls.houseNumber.invalid && this.addressForm.get('houseNumber').value !== null && addressForm.controls.houseNumber.touched">{{ 'custom-form-io-components.form-io-address.house-number' | translate }} {{ 'custom-form-io-components.isInvalid' | translate }}</div>
          </div>
        </cds-label>

        <cds-label for="houseLetter" class="input-small">
          {{ 'custom-form-io-components.form-io-address.house-letter' | translate }}:
          <div class="input-group">
            <input cdsText id="houseLetter" type="text" formControlName="houseLetter">
            <div class="validation-message" *ngIf="this.required && addressForm.controls.houseLetter.invalid && addressForm.controls.houseLetter.touched">{{ 'custom-form-io-components.form-io-address.house-letter' | translate }} {{ 'custom-form-io-components.isRequired' | translate }}</div>
          </div>
        </cds-label>

        <cds-label for="houseNumberAddition" class="input-large">
          {{ 'custom-form-io-components.form-io-address.house-number-addition' | translate }}:
          <div class="input-group">
            <input cdsText id="houseNumberAddition" type="text" formControlName="houseNumberAddition">
            <div class="validation-message" *ngIf="this.required && addressForm.controls.houseNumberAddition.invalid && addressForm.controls.houseNumberAddition.touched">{{ 'custom-form-io-components.form-io-address.house-number-addition' | translate }} {{ 'custom-form-io-components.isRequired' | translate }}</div>
          </div>
        </cds-label>
      </div>

      <div class="address-row">
        <cds-label for="postalCode" class="input-small">
          {{ 'custom-form-io-components.form-io-address.postal-code' | translate }}:
          <div class="input-group">
            <input cdsText id="postalCode" type="text" formControlName="postalCode" mask="0000 SS" (input)="toUpper($event)">
            <div class="validation-message" *ngIf="this.required && addressForm.controls.postalCode.invalid && this.addressForm.get('postalCode').value === '' && addressForm.controls.postalCode.touched">{{ 'custom-form-io-components.form-io-address.postal-code' | translate }} {{ 'custom-form-io-components.isRequired' | translate }}</div>
            <div class="validation-message" *ngIf="this.required && addressForm.controls.postalCode.invalid && this.addressForm.get('postalCode').value !== '' && addressForm.controls.postalCode.touched">{{ 'custom-form-io-components.form-io-address.postal-code' | translate }} {{ 'custom-form-io-components.isInvalid' | translate }}</div>
          </div>
        </cds-label>

        <cds-label for="city" class="input-large">
          {{ 'custom-form-io-components.form-io-address.city' | translate }}:
          <div class="input-group">
            <input cdsText id="city" type="text" formControlName="city">
            <div class="validation-message" *ngIf="this.required && addressForm.controls.city.invalid && addressForm.controls.city.touched">{{ 'custom-form-io-components.form-io-address.city' | translate }} {{ 'custom-form-io-components.isRequired' | translate }}</div>
          </div>
        </cds-label>
      </div>
    </div>

  `,
  styles: [`
    .address-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .address-row {
      display: flex;
      gap: 10px;
    }
    .street {
      flex: 3;
    }
    .input-small {
      flex: 1;
    }
    .input-large {
      flex: 2;
    }
    .input-group {
      display: flex;
      flex-direction: column;
    }
    .validation-message {
        color: #dc3545;
        font-size: 14.4px;
        margin-top: 2px;
    }
  `]
})
export class FormIoAddressComponent implements FormioCustomComponent<any> {
  @Input() value: any;
  @Input() disabled: boolean = false;
  @Input() mask: boolean = false;
  @Input() required: boolean = false;
  @Input() requiredStreet: boolean = false;
  @Input() requiredHouseNumber: boolean = false;
  @Input() requiredHouseLetter: boolean = false;
  @Input() requiredHouseNumberAddition: boolean = false;
  @Input() requiredPostalCode: boolean = false;
  @Input() requiredCity: boolean = false;
  @Input() keyLanguage: any;
  @Output() valueChange = new EventEmitter<any>();

  addressForm = new FormGroup({
    street: new FormControl(''),
    houseNumber: new FormControl(''),
    houseLetter: new FormControl(''),
    houseNumberAddition: new FormControl(''),
    postalCode: new FormControl(''),
    city: new FormControl('')
  });

  constructor() {
    console.log('this: ', this);
    setTimeout( () => {
      console.log('langcon: ', this.keyLanguage);

      this.addressForm.controls.street.setValue(this.value?.street);
      this.addressForm.controls.street.setValidators(this.requiredStreet ? Validators.required : []);
      this.addressForm.controls.street.updateValueAndValidity();

      this.addressForm.controls.houseNumber.setValue(this.value?.houseNumber);
      this.addressForm.controls.houseNumber.setValidators(this.requiredHouseNumber ? [Validators.required, Validators.pattern(/^[0-9]*[1-9][0-9]*$/)] : Validators.pattern(/^[0-9]*[1-9][0-9]*$/));
      this.addressForm.controls.houseNumber.updateValueAndValidity();

      this.addressForm.controls.houseLetter.setValue(this.value?.houseLetter);
      this.addressForm.controls.houseLetter.setValidators(this.requiredHouseLetter ? Validators.required : []);
      this.addressForm.controls.houseLetter.updateValueAndValidity();

      this.addressForm.controls.houseNumberAddition.setValue(this.value?.houseNumberAddition);
      this.addressForm.controls.houseNumberAddition.setValidators(this.requiredHouseNumberAddition ? Validators.required : []);
      this.addressForm.controls.houseNumberAddition.updateValueAndValidity();

      this.addressForm.controls.postalCode.setValue(this.value?.postalCode);
      this.addressForm.controls.postalCode.setValidators(this.requiredPostalCode ? [Validators.required, Validators.pattern(/^[0-9]{4} ?[A-Z]{2}$/)] : Validators.pattern(/^[0-9]{4} ?[A-Z]{2}$/));
      this.addressForm.controls.postalCode.updateValueAndValidity();

      this.addressForm.controls.city.setValue(this.value?.city);
      this.addressForm.controls.city.setValidators(this.requiredCity ? Validators.required : []);
      this.addressForm.controls.city.updateValueAndValidity();

      if (this.disabled) {
        Object.keys(this.addressForm.controls).forEach((key) => {
          this.addressForm.get(key).disable();
        })
      }

      this.addressForm.valueChanges.subscribe(() => {
        this.onValueChange();
      });
    }, 0);
  }

  onValueChange(): void {
    console.log('value: ', this.value);
    let valueWithTranslatedKeys;
    console.log('lang: ', this.keyLanguage);
    if (this.keyLanguage === 'nl') {
      valueWithTranslatedKeys = {
        straat: this.addressForm.value.street,
        huisnummer: this.addressForm.value.houseNumber,
        huisletter: this.addressForm.value.houseLetter,
        huisnummertoevoeging: this.addressForm.value.houseNumberAddition,
        postcode: this.addressForm.value.postalCode,
        plaats: this.addressForm.value.city,
      };
    } else if (this.keyLanguage === 'de') {
      valueWithTranslatedKeys = {
        strasse: this.addressForm.value.street,
        hausnummer: this.addressForm.value.houseNumber,
        hausBuchstabe: this.addressForm.value.houseLetter,
        hausnummerZusatz: this.addressForm.value.houseNumberAddition,
        postleitzahl: this.addressForm.value.postalCode,
        stadt: this.addressForm.value.city
      };
    } else {
      valueWithTranslatedKeys = this.addressForm.value;
    }
    this.value = this.addressForm.valid ? valueWithTranslatedKeys : [valueWithTranslatedKeys];
    this.valueChange.emit(this.value);
  }
  toUpper(event: any): void {
    event.target.value = event.target.value.toUpperCase();
    this.addressForm.controls.postalCode.setValue(event.target.value);
  }
}
