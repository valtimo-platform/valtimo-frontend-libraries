import {Injectable, signal, WritableSignal} from '@angular/core';
import {WidgetStyle, WidgetType, WidgetWidth} from '../models';

@Injectable({
  providedIn: 'root',
})
export class WidgetWizardService {
  public selectedWidget: WritableSignal<WidgetType | null> = signal(null);

  public widgetWidth: WritableSignal<WidgetWidth | null> = signal(null);

  public widgetStyle: WritableSignal<WidgetStyle | null> = signal(null);

  public widgetContent: WritableSignal<{[columnIndex: number]: any} | null> = signal(null);

  public widgetTitle: WritableSignal<string | null> = signal(null);
}
