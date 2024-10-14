import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

/**
 * Custom decimal validator for angular forms.
 * Checks if the decimal number is valid.
 *
 * @returns Null if the decimal number is not valid or the value is an empty string, else return an object with isDecimalValid property.
 */
export function decimalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valueString = String(control.value);
    if (valueString.match(/^$/)) {
      return null;
    }
    const rearranged = valueString.substring(4, valueString.length) + valueString.substring(0, 4);
    const numeric = Array.from(rearranged)
      .map(c => (isNaN(parseInt(c, 10)) ? (c.charCodeAt(0) - 55).toString() : c))
      .join('');
    const isValidDecimal = Array.from(numeric)
      .map(c => parseInt(c, 10))
      .reduce((remainder, value) => (remainder * 10 + value) % 97, 0);
    return isValidDecimal === 1 ? null : {isDecimalValid: 'Decimale voldoet niet'};
  };
}
