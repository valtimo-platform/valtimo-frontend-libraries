import {Injectable} from '@angular/core';
import {Observable, of, Subject, take, timer} from 'rxjs';
import {
  CachedResolvedPermissions,
  PendingPermissions,
  PermissionRequestCollection,
  ResolvedPermissions,
} from '../models';
import {getCollectionKey} from '../utils';
import {PermissionApiService} from './permission-api.service';
import {KeycloakService} from 'keycloak-angular';
import {fromPromise} from 'rxjs/internal/observable/innerFrom';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly _cachedResolvedPermissions: CachedResolvedPermissions = {};
  private readonly _pendingPermissions: PendingPermissions = {};

  constructor(
    private readonly permissionApiService: PermissionApiService,
    private readonly keyCloakService: KeycloakService
  ) {}

  requestPermission(
    permissionRequestCollection: PermissionRequestCollection,
    permissionRequestCollectionKey: string
  ): Observable<boolean> {
    const collectionKey = getCollectionKey(permissionRequestCollection);
    const cachedResolvedPermissionCollection =
      this._cachedResolvedPermissions[getCollectionKey(permissionRequestCollection)];
    const pendingPermissionCollection = this._pendingPermissions[collectionKey];

    // return cached permission if available
    if (cachedResolvedPermissionCollection) {
      console.log('return cached', permissionRequestCollectionKey);

      return of(cachedResolvedPermissionCollection[permissionRequestCollectionKey]);
      // return observable if request is already pending
    } else if (pendingPermissionCollection) {
      console.log('return existing pending', permissionRequestCollectionKey);

      return pendingPermissionCollection[permissionRequestCollectionKey];
      // create new object of pending request observables and request permissions
    } else {
      this._pendingPermissions[collectionKey] = Object.keys(permissionRequestCollection).reduce(
        (acc, permissionRequestCollectionKey) => {
          return {...acc, [permissionRequestCollectionKey]: new Subject<boolean>()};
        },
        {}
      );

      this.requestPermissions(permissionRequestCollection);

      console.log('return new pending', permissionRequestCollectionKey);

      return this._pendingPermissions[collectionKey][permissionRequestCollectionKey].asObservable();
    }
  }

  private requestPermissions(collection: PermissionRequestCollection): void {
    this.permissionApiService
      .resolvePermissionRequestCollection(collection)
      .pipe(take(1))
      .subscribe(resolvedCollection => {
        Object.keys(resolvedCollection).forEach(collectionPermissionKey => {
          const collectionKey = getCollectionKey(collection);

          this._pendingPermissions[collectionKey][collectionPermissionKey].next(
            resolvedCollection[collectionPermissionKey]
          );

          this.cacheResolvedPermissions(collectionKey, resolvedCollection);
        });
      });
  }

  private cacheResolvedPermissions(
    collectionKey: string,
    resolvedPermissions: ResolvedPermissions
  ): void {
    console.log('cache permissions', collectionKey, resolvedPermissions);
    this._cachedResolvedPermissions[collectionKey] = resolvedPermissions;
    this.openClearCacheSubscription(collectionKey);
  }

  private openClearCacheSubscription(collectionKey): void {
    fromPromise(this.keyCloakService.getToken())
      .pipe(take(1))
      .subscribe(token => {
        const tokenExp = (jwt_decode(token) as any).exp * 1000;
        const expiryTime = tokenExp - Date.now() - 1000;

        timer(expiryTime)
          .pipe(take(1))
          .subscribe(() => {
            if (this._cachedResolvedPermissions[collectionKey]) {
              console.log('clear cache', collectionKey);
              delete this._cachedResolvedPermissions[collectionKey];
            }
          });
      });
  }
}
