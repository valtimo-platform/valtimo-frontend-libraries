import {Subject} from 'rxjs';

import {PERMISSION_ACTION, PERMISSION_RESOURCE} from './permission.types';

interface PermissionContext {
  identifier: string;
  resource: PERMISSION_RESOURCE;
}

interface PermissionRequest {
  action: PERMISSION_ACTION;
  resource: PERMISSION_RESOURCE;
  context?: PermissionContext;
}

interface PermissionRequestCollection {
  [key: string]: PermissionRequest;
}

interface PermissionResponse {
  request: PermissionRequest;
  available: boolean;
}

interface CachedResolvedPermissions {
  [collectionKey: string]: {
    [permissionRequestCollectionKey: string]: boolean;
  };
}

interface PendingPermissions {
  [collectionKey: string]: {
    [permissionRequestCollectionKey: string]: Subject<boolean>;
  };
}

interface ResolvedPermissions {
  [permissionRequestCollectionKey: string]: boolean;
}

export {
  CachedResolvedPermissions,
  PendingPermissions,
  PermissionContext,
  PermissionRequest,
  PermissionRequestCollection,
  PermissionResponse,
  ResolvedPermissions,
};
