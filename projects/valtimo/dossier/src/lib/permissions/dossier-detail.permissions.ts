import {PermissionRequestCollection, PermissionRequestCollectionKeys} from '@valtimo/security';

const DOSSIER_DETAIL_PERMISSIONS_KEYS: PermissionRequestCollectionKeys = {
  canCreateTestCase: 'canCreateTestCase',
  canOpenSummaryTab: 'canOpenSummaryTab',
};

const DOSSIER_DETAIL_PERMISSIONS: PermissionRequestCollection = {
  [DOSSIER_DETAIL_PERMISSIONS_KEYS.canCreateTestCase]: {
    action: 'canCreateCase',
    context: {caseId: 'test'},
  },
  [DOSSIER_DETAIL_PERMISSIONS_KEYS.canOpenSummaryTab]: {
    action: 'canOpenDossierTab',
    context: {tabId: 'summary'},
  },
};

export {DOSSIER_DETAIL_PERMISSIONS_KEYS, DOSSIER_DETAIL_PERMISSIONS};
