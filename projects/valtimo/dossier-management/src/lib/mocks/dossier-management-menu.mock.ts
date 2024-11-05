import {DossierManagemetnMenuItem, TabEnum} from '../models';

export const MENU_ITEMS: DossierManagemetnMenuItem[] = [
  {
    title: 'Document definition',
    description: 'Edit your document definition schema',
    iconUrl: 'valtimo-layout/img/no-results.svg',
    urlPath: TabEnum.DOCUMENT,
  },
  {
    title: 'Configuration',
    description: 'Edit your case configuration',
    iconUrl: 'valtimo-layout/img/no-results.svg',
    urlPath: TabEnum.CASE,
  },
  {
    title: 'Process',
    description: 'Edit processes linked to your case',
    iconUrl: 'valtimo-layout/img/no-results.svg',
    urlPath: TabEnum.PROCESSES,
  },
  {
    title: 'Search fields',
    description: 'Edit serach fields available for your case',
    iconUrl: 'valtimo-layout/img/no-results.svg',
    urlPath: TabEnum.SEARCH,
  },
  {
    title: 'List fields',
    description: 'Edit fields visible in your case list',
    iconUrl: 'valtimo-layout/img/no-results.svg',
    urlPath: TabEnum.LIST,
  },
  {
    title: 'Tabs',
    description: 'Edit tabs visible in your case details',
    iconUrl: 'valtimo-layout/img/no-results.svg',
    urlPath: TabEnum.TABS,
  },
  {
    title: 'Statuses',
    description: 'Edit statuses available for your case',
    iconUrl: 'valtimo-layout/img/no-results.svg',
    urlPath: TabEnum.STATUSES,
  },
  {
    title: 'ZGW',
    description: 'Edit DocumentenAPI documents columns and tags for your case',
    iconUrl: 'valtimo-layout/img/no-results.svg',
    urlPath: 'dossierManagement.tabs.zgw',
  },
];
