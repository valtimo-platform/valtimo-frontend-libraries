interface DashboardWidget {
  title: string;
  key: string;
  dataSourceKey: string;
  dataSourceProperties: {[key: string]: any};
  displayType: string;
  order: number;
}

export {DashboardWidget};
