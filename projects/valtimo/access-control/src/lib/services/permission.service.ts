import {Injectable} from '@angular/core';
import jwt_decode from 'jwt-decode';
import {KeycloakService} from 'keycloak-angular';
import {NGXLogger} from 'ngx-logger';
import {Observable, of, Subject, Subscription, switchMap, take, tap, timer} from 'rxjs';
import {fromPromise} from 'rxjs/internal/observable/innerFrom';
import {
  CachedResolvedPermissions,
  PendingPermissions,
  PermissionContext,
  PermissionRequest,
  PermissionRequestQueue,
  ResolvedPermissions,
} from '../models';
import {PermissionApiService} from './permission-api.service';
import {getPermissionRequestKey} from '../utils/permission.utils';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly QUEUE_COLLECTION_PERIOD_MS = 15;
  private _cachedResolvedPermissions: CachedResolvedPermissions = {};
  private _pendingPermissions: PendingPermissions = {};
  private _permissionRequestQueue: PermissionRequestQueue = [];
  private _permissionQueueSubscription!: Subscription;
  private _clearCacheSubscription!: Subscription;

  constructor(
    private readonly keyCloakService: KeycloakService,
    private readonly logger: NGXLogger,
    private readonly permissionApiService: PermissionApiService
  ) {}

  public requestPermission(
    permissionRequest: PermissionRequest,
    context: PermissionContext
  ): Observable<boolean> {
    const permissionRequestWithContext = {...permissionRequest, context};
    const permissionRequestKey = getPermissionRequestKey(permissionRequestWithContext);
    const cachedResolvedPermission = this._cachedResolvedPermissions[permissionRequestKey];
    const pendingPermissionRequest = this._pendingPermissions[permissionRequestKey];

    if (Object.keys(this._cachedResolvedPermissions).includes(permissionRequestKey)) {
      this.logger.debug(
        'Permissions: return cached resolved permission',
        permissionRequestKey,
        cachedResolvedPermission
      );

      return of(cachedResolvedPermission);
    }

    if (pendingPermissionRequest) {
      this.logger.debug('Permissions: return existing pending permission', permissionRequestKey);

      return pendingPermissionRequest;
    }

    this._pendingPermissions[permissionRequestKey] = new Subject<boolean>();

    this.queuePermission(permissionRequestWithContext);

    this.logger.debug('Permissions: return new pending', permissionRequestKey);

    return this._pendingPermissions[permissionRequestKey].asObservable();
  }

  private queuePermission(permissionRequest: PermissionRequest): void {
    if (!this._permissionQueueSubscription || this._permissionQueueSubscription.closed) {
      this.logger.debug('Permissions: open new queue subscription');

      this.openQueueSubscription();
    }

    this._permissionRequestQueue.push(permissionRequest);

    this.logger.debug(`Permissions: add request to queue: ${JSON.stringify(permissionRequest)}`);
  }

  private openQueueSubscription(): void {
    this._permissionQueueSubscription = timer(this.QUEUE_COLLECTION_PERIOD_MS)
      .pipe(take(1))
      .subscribe(() => {
        this.logger.debug('Permissions: queue timer finished');
        this.logger.debug('Permissions: unsubscribe from queue timer');
        this._permissionQueueSubscription?.unsubscribe();

        const queueCopy = [...this._permissionRequestQueue];

        this.emptyQueue();

        this.permissionApiService
          .resolvePermissionRequestQueue(queueCopy)
          .pipe(take(1))
          .subscribe(resolvedPermissions => {
            Object.keys(resolvedPermissions).forEach(permissionRequestKey => {
              this._pendingPermissions[permissionRequestKey].next(
                resolvedPermissions[permissionRequestKey]
              );
              this.logger.debug(
                `Permissions: resolved pending permission request ${permissionRequestKey}`,
                resolvedPermissions[permissionRequestKey]
              );
            });

            this.cacheResolvedPermissions(resolvedPermissions);
          });
      });
  }

  private cacheResolvedPermissions(resolvedPermissions: ResolvedPermissions): void {
    Object.keys(resolvedPermissions).forEach(permissionRequestKey => {
      this._cachedResolvedPermissions[permissionRequestKey] =
        resolvedPermissions[permissionRequestKey];
      this.logger.debug('Permissions: cache resolved permission request', permissionRequestKey);
    });

    if (!this._clearCacheSubscription || this._clearCacheSubscription.closed) {
      this.openClearCacheSubscription();
    }
  }

  private openClearCacheSubscription(): void {
    this._clearCacheSubscription = fromPromise(this.keyCloakService.getToken())
      .pipe(
        take(1),
        switchMap(token => {
          const tokenExp = (jwt_decode(token) as any).exp * 1000;
          const expiryTime = tokenExp - Date.now() - 1000;
          return timer(expiryTime);
        }),
        tap(() => {
          this.clearPending();
          this.clearCache();
          this._clearCacheSubscription?.unsubscribe();
        })
      )
      .subscribe();
  }

  private emptyQueue(): void {
    this.logger.debug('Permissions: empty queue');
    this._permissionRequestQueue = [];
  }

  private clearCache(): void {
    this.logger.debug('Permissions: clear cache');
    this._cachedResolvedPermissions = {};
  }

  private clearPending(): void {
    this.logger.debug('Permissions: clear pending');
    this._pendingPermissions = {};
  }
}
