import {Injectable, signal, WritableSignal} from '@angular/core';
import {WidgetStyle, WidgetType, WidgetTypes, WidgetWidth} from '../models';
import {DossierManagementWidgetFieldsComponent} from '../components/dossier-management-widget-configurators/fields/dossier-management-widget-fields.component';

@Injectable({
  providedIn: 'root',
})
export class WidgetWizardService {
  public selectedWidget: WritableSignal<WidgetType | null> = signal({
    titleKey: 'widgetTabManagement.types.fields.title',
    descriptionKey: 'widgetTabManagement.types.fields.description',
    illustrationUrl: 'valtimo-layout/img/widget-management/types/fields.svg',
    type: WidgetTypes.FIELDS,
    component: DossierManagementWidgetFieldsComponent,
  });

  public widgetWidth: WritableSignal<WidgetWidth | null> = signal(WidgetWidth.FULL_WIDTH);

  public widgetStyle: WritableSignal<WidgetStyle | null> = signal(WidgetStyle.DEFAULT);

  public widgetContent: WritableSignal<{[columnIndex: number]: any} | null> = signal(null);

  public widgetTitle: WritableSignal<string | null> = signal(null);
}
