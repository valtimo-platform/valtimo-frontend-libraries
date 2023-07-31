import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

import {BigNumberData} from '../../../models';

@Component({
  selector: 'valtimo-big-number-widget',
  templateUrl: './big-number-widget.component.html',
  styleUrls: ['./big-number-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BigNumberWidgetComponent {
  @Input() data: BigNumberData;
}
