import {Subject} from 'rxjs';

interface PermissionRequest {
  action: string;
  context: {
    [key: string]: any;
  };
}

interface PermissionRequestCollectionKeys {
  [key: string]: string;
}

interface PermissionRequestCollection {
  [key: string]: PermissionRequest;
}

interface CachedResolvedPermissions {
  [collectionKey: string]: {
    ResolvedPermission;
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
  PermissionRequest,
  PermissionRequestCollection,
  PermissionRequestCollectionKeys,
  CachedResolvedPermissions,
  ResolvedPermissions,
  PendingPermissions,
};
