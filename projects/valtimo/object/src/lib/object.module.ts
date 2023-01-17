import { NgModule } from '@angular/core';
import {ObjectRoutingModule} from './object-routing.module';
import {ObjectListComponent} from './components/object-list/object-list.component';
import {TranslateModule} from '@ngx-translate/core';
import {AsyncPipe, CommonModule} from '@angular/common';
import {ListModule, WidgetModule} from '@valtimo/components';

@NgModule({
  declarations: [
    ObjectListComponent
  ],
  imports: [
    CommonModule,
    ObjectRoutingModule,
    TranslateModule,
    AsyncPipe,
    WidgetModule,
    ListModule
  ],
  exports: [
  ]
})
export class ObjectModule { }
