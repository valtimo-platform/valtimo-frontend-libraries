export interface DashboardItem {
  description: string;
  key: string;
  name: string;
  roles: Array<string>;
  createdBy?: string;
  createdOn?: string;
}
