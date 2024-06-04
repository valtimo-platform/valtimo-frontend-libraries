import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {WidgetConfig, WidgetStyle, WidgetTypeSelection, WidgetType, WidgetWidth} from '../models';

@Injectable({
  providedIn: 'root',
})
export class WidgetWizardService {
  public readonly selectedWidget: WritableSignal<WidgetTypeSelection | null> = signal(null);

  public readonly widgetWidth: WritableSignal<WidgetWidth | null> = signal(null);

  public readonly widgetStyle: WritableSignal<WidgetStyle | null> = signal(null);

  public readonly widgetContent: WritableSignal<{[columnIndex: number]: any} | null> = signal(null);

  public readonly widgetTitle: WritableSignal<string | null> = signal(null);

  public readonly widgetsConfig: Signal<WidgetConfig> = computed(() => ({
    key: (this.widgetTitle() ?? '').replace(/\W+/g, '-').replace(/\-$/, '').toLowerCase(),
    title: this.widgetTitle() ?? '',
    type: this.selectedWidget()?.type ?? WidgetType.FIELDS,
    width: this.widgetWidth() ?? WidgetWidth.FULL_WIDTH,
    highContrast: (this.widgetStyle() ?? WidgetStyle.DEFAULT) === WidgetStyle.HIGH_CONTRAST,
    properties: {
      columns: Object.values(this.widgetContent() ?? {}),
    },
  }));

  public resetWizard(): void {
    this.selectedWidget.set(null);
    this.widgetWidth.set(null);
    this.widgetStyle.set(null);
    this.widgetContent.set(null);
    this.widgetTitle.set(null);
  }
}
