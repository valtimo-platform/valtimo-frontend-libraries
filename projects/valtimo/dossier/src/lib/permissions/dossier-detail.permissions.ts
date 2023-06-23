import {PermissionRequestCollection} from '@valtimo/security';

enum DOSSIER_DETAIL_PERMISSIONS_KEYS {
  canCreateCase,
  canStartSubProcess,
  canOpenSummaryTab,
  canSearch,
}

const DOSSIER_DETAIL_PERMISSIONS: PermissionRequestCollection = {
  [DOSSIER_DETAIL_PERMISSIONS_KEYS.canCreateCase]: {
    action: 'canCreateCase',
    context: {caseId: 'test'},
  },
  [DOSSIER_DETAIL_PERMISSIONS_KEYS.canOpenSummaryTab]: {
    action: 'canOpenTab',
    context: {tabId: 'summary'},
  },
  [DOSSIER_DETAIL_PERMISSIONS_KEYS.canStartSubProcess]: {
    action: 'canStartSubProcess',
    context: {caseId: 'test'},
  },
  [DOSSIER_DETAIL_PERMISSIONS_KEYS.canSearch]: {
    action: 'canSearch',
    context: {caseId: 'test'},
  },
};

export {DOSSIER_DETAIL_PERMISSIONS_KEYS, DOSSIER_DETAIL_PERMISSIONS};
