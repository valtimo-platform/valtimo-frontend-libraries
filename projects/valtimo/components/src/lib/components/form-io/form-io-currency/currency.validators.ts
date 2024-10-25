import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import moment from 'moment';

/**
 * Custom currency validator for angular forms.
 * Checks if the currency number is valid.
 *
 * @returns Null if the currency number is not valid or the value is an empty string, else return an object with isCurrencyValid property.
 */
export function currencyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const locale = moment.locale(localStorage.getItem('langKey')) || 'en';
    const valueString = String(control.value);
    let formattedValue: string;

    if (valueString.match(/^$/)) {
      return null;
    }

    console.log('valueString: ', valueString);

    // if (locale === 'nl') {
    //   formattedValue = valueString.replace('.', ',').replace(/\s/g, '');
    // } else {
    //   formattedValue = valueString.replace(',', '.').replace(/\s/g, '');
    // }
    // const isValidCurrency = !isNaN(Number(formattedValue));
    // return isValidCurrency ? null : {isValidCurrency: 'Munteenheid voldoet niet'};
    // Determina el formato de acuerdo al locale
    if (locale === 'en') {
      formattedValue = valueString.replace(/,/g, '').replace(/[^0-9.]/g, '');
      if (!/^\d+(\.\d{1,2})?$/.test(formattedValue)) {
        return {invalidCurrency: true};
      }
    } else if (locale === 'nl') {
      formattedValue = valueString.replace(/\./g, '').replace(/[^0-9,]/g, '');
      if (!/^\d+(,\d{1,2})?$/.test(formattedValue)) {
        return {invalidCurrency: true};
      }
    } else {
      return null;
    }

    control.setValue(formattedValue);

    return null;
  };
}
