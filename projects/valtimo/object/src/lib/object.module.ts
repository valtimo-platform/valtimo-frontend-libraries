import { NgModule } from '@angular/core';
import {ObjectRoutingModule} from './object-routing.module';
import {ObjectListComponent} from './components/object-list/object-list.component';
import {TranslateModule} from '@ngx-translate/core';
import {AsyncPipe, CommonModule} from '@angular/common';
import {ListModule, WidgetModule} from '@valtimo/components';
import {ObjectDetailContainerComponent} from './components/object-detail-container/object-detail-container.component';
import {ObjectDetailComponent} from './components/object-detail-container/tabs/object-detail/object-detail.component';
import {ButtonModule, IconModule} from 'carbon-components-angular';

@NgModule({
  declarations: [
    ObjectListComponent,
    ObjectDetailContainerComponent,
    ObjectDetailComponent
  ],
  imports: [
    CommonModule,
    ObjectRoutingModule,
    TranslateModule,
    AsyncPipe,
    WidgetModule,
    ListModule,
    ButtonModule,
    IconModule
  ],
  exports: [
  ]
})
export class ObjectModule { }
