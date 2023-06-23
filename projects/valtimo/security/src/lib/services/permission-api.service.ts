import {Injectable} from '@angular/core';
import {PermissionRequestCollection, ResolvedPermissions} from '../models';
import {delay, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PermissionApiService {
  resolvePermissionRequestCollection(
    permissionRequestCollection: PermissionRequestCollection
  ): Observable<ResolvedPermissions> {
    const resolvedPermissions = Object.keys(permissionRequestCollection).reduce((acc, curr) => {
      return {...acc, [curr]: true};
    }, {});

    return of(resolvedPermissions).pipe(delay(1000));
  }
}
