import {NgModule} from '@angular/core';
import {BarChartModule} from './bar-chart';
import {BigNumberModule} from './big-number';
import {DonutModule} from './donut';
import {GaugeModule} from './gauge';
import {MeterModule} from './meter';

@NgModule({
  declarations: [],
  imports: [BarChartModule, BigNumberModule, DonutModule, GaugeModule, MeterModule],
  exports: [],
  providers: [],
})
export class DisplayWidgetTypesModule {}
