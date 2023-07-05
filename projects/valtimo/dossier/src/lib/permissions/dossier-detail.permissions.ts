import {
  PermissionRequestCollection,
  PERMISSION_ACTION,
  PERMISSION_RESOURCE,
} from '@valtimo/access-control';

enum DOSSIER_DETAIL_PERMISSIONS_KEYS {
  canClaimCase,
}

const DOSSIER_DETAIL_PERMISSIONS: PermissionRequestCollection = {
  [DOSSIER_DETAIL_PERMISSIONS_KEYS.canClaimCase]: {
    action: PERMISSION_ACTION.claim,
    resource: PERMISSION_RESOURCE.domain,
  },
};

export {DOSSIER_DETAIL_PERMISSIONS_KEYS, DOSSIER_DETAIL_PERMISSIONS};
