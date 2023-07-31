import {WidgetSeverity} from './widget-display.model';

export interface BigNumberData {
  title: string;
  subtitle: string;
  number: number;
  severity: WidgetSeverity;
  label?: string;
}

export interface WidgetData {
  data: BigNumberData;
}
