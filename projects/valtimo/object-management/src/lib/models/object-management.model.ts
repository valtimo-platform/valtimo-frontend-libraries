interface Objecttype {
  id: string;
  title: string;
  objecttypenApiPluginConfigurationId: string;
  objecttypeId: string;
  objecttypeVersion: number;
  objectenApiPluginConfigurationId: string;
  showInDataMenu: boolean;
  formDefinitionView?: string;
  formDefinitionEdit?: string;
}

export interface SearchListColumn {
  ownerId?: string;
  title: string;
  key: string;
  path: string;
  displayType: DisplayType;
  sortable: boolean;
  defaultSort: string;
}

export interface SearchColumn {
  propertyName: string;
  translationKey: string;
  sortable?: boolean;
  viewType?: string;
  default?: boolean | string;
  enum?: Array<string> | {[key: string]: string};
  title?: string;
  format?: string;
  key?: string;
}


export interface SearchListColumnView {
  title: string;
  key: string;
  path: string;
  displayType: string;
  displayTypeParameters: string;
  sortable: boolean;
  defaultSort: string;
}

export interface DisplayType {
  type: string;
  displayTypeParameters: DisplayTypeParameters;
}

export interface DisplayTypeParameters {
  enum?: {
    [key: string]: string;
  };
  dateFormat?: string;
}

type ObjecttypeKeys = keyof Objecttype;

export {Objecttype, ObjecttypeKeys};
