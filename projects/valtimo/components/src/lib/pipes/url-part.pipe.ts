import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'urlPart'})
export class UrlPartPipe implements PipeTransform {
  transform(text: string, amountOfParts: number): string {
    return text
      .split('/')
      .slice(0, amountOfParts + 1)
      .join('/');
  }
}
