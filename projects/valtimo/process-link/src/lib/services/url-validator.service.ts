import {map, Observable} from 'rxjs';
import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {take} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {UrlResolverService} from './url-resolver.service';

@Injectable()
export class UrlValidatorService {

  constructor(
    private readonly urlResolverService: UrlResolverService) {
  }

  public urlValidator(variables: Observable<Map<string, string>>): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return variables.pipe(
        take(1),
        map(variables => {
          const url = this.urlResolverService.resolveUrlVariables(control.value, variables);
          try {
            new URL(url);
            return null;
          } catch (_) {
            return {invalidUrl: url};
          }
        })
      );
    };
  }

}
