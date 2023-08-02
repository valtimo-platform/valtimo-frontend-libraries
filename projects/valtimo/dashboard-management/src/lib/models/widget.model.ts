interface DashboardWidget {
  title: string;
  key: string;
  dataSourceKey: string;
  dataSourceProperties: {[key: string]: any};
  displayType: string;
  order: number;
}

type WidgetModalType = 'create' | 'edit' | 'delete';

interface WidgetDataSource {
  key: string;
  title: string;
  dataFeatures: Array<string>;
}

export {DashboardWidget, WidgetModalType, WidgetDataSource};
