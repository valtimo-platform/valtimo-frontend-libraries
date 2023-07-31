import {ChangeDetectionStrategy, Component, HostBinding, Input} from '@angular/core';

import {WidgetSeverity, WidgetType} from '../../models';

@Component({
  selector: 'valtimo-widget-display',
  templateUrl: './widget-display.component.html',
  styleUrls: ['./widget-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetDisplayComponent {
  @HostBinding('class') class = WidgetSeverity.RED;

  @Input() widgetType: WidgetType;
  @Input() widgetData: object;

  public readonly WidgetType = WidgetType;
}
