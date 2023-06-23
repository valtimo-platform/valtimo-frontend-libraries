import {Subject} from 'rxjs';

interface PermissionRequest {
  action: string;
  context: {
    [key: string]: any;
  };
}
interface PermissionRequestCollection {
  [key: string]: PermissionRequest;
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
  PermissionRequest,
  PermissionRequestCollection,
  CachedResolvedPermissions,
  ResolvedPermissions,
  PendingPermissions,
};
