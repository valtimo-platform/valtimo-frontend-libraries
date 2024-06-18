import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {WidgetStyle, WidgetTypeSelection} from '../models';
import {
  BasicCaseWidget,
  CaseWidgetType,
  CaseWidgetWidth,
  WidgetContentProperties,
} from '@valtimo/dossier';
import {DossierManagementWidgetTableComponent} from '../components/dossier-management-widget-configurators';

@Injectable({
  providedIn: 'root',
})
export class WidgetWizardService {
  public readonly selectedWidget: WritableSignal<WidgetTypeSelection | null> = signal({
    titleKey: 'widgetTabManagement.types.table.title',
    descriptionKey: 'widgetTabManagement.types.table.description',
    illustrationUrl: 'valtimo-layout/img/widget-management/types/table.svg',
    type: CaseWidgetType.TABLE,
    component: DossierManagementWidgetTableComponent,
  });

  public readonly widgetWidth: WritableSignal<CaseWidgetWidth | null> = signal(4);

  public readonly widgetStyle: WritableSignal<WidgetStyle | null> = signal(WidgetStyle.DEFAULT);

  public readonly widgetContent: WritableSignal<WidgetContentProperties | null> = signal(null);

  public readonly widgetTitle: WritableSignal<string | null> = signal(null);

  public readonly widgetKey: WritableSignal<string | null> = signal(null);

  public readonly widgetsConfig: Signal<BasicCaseWidget> = computed(() => ({
    key: this.widgetKey() ?? '',
    title: this.widgetTitle() ?? '',
    type: this.selectedWidget()?.type ?? CaseWidgetType.FIELDS,
    width: this.widgetWidth() ?? 4,
    highContrast: (this.widgetStyle() ?? WidgetStyle.DEFAULT) === WidgetStyle.HIGH_CONTRAST,
    properties: this.widgetContent() ?? ({} as any),
  }));

  public readonly editMode: WritableSignal<boolean> = signal(false);

  public resetWizard(): void {
    this.selectedWidget.set(null);
    this.widgetWidth.set(null);
    this.widgetStyle.set(null);
    this.widgetContent.set(null);
    this.widgetTitle.set(null);
    this.widgetKey.set(null);
    this.editMode.set(false);
  }
}
