import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'arrayToString'})
export class ArrayToStringPipe implements PipeTransform {
  transform(array: Array<string>): string {
    return Array.isArray(array) ? array.join('') : '';
  }
}
