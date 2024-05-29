import {computed, Injectable, signal, WritableSignal} from '@angular/core';
import {DossierManagementWidgetFieldsComponent} from '../components/dossier-management-widget-configurators/fields/dossier-management-widget-fields.component';
import {WidgetStyle, WidgetType, WidgetTypes, WidgetWidth} from '../models';

@Injectable({
  providedIn: 'root',
})
export class WidgetWizardService {
  public selectedWidget: WritableSignal<WidgetType | null> = signal(null);

  public widgetWidth: WritableSignal<WidgetWidth | null> = signal(null);

  public widgetStyle: WritableSignal<WidgetStyle | null> = signal(null);

  public widgetContent: WritableSignal<{[columnIndex: number]: any} | null> = signal(null);

  public widgetTitle: WritableSignal<string | null> = signal(null);

  public widgetsConfig = computed(() => ({
    key: this.widgetTitle()?.replace(/\W+/g, '-').replace(/\-$/, '').toLowerCase(),
    type: this.selectedWidget()?.type,
    title: this.widgetTitle(),
    width: this.widgetWidth(),
    highContrast: this.widgetStyle() === WidgetStyle.HIGH_CONTRAST,
    properties: {
      columns: Object.values(this.widgetContent() ?? {}),
    },
  }));
}
