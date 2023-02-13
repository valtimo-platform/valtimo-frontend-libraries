import { NgModule } from '@angular/core';
import {ObjectRoutingModule} from './object-routing.module';
import {ObjectListComponent} from './components/object-list/object-list.component';
import {TranslateModule} from '@ngx-translate/core';
import {AsyncPipe, CommonModule} from '@angular/common';
import {ConfirmationModalModule, ListModule, SpinnerModule, WidgetModule} from '@valtimo/components';
import {ObjectDetailContainerComponent} from './components/object-detail-container/object-detail-container.component';
import {ObjectDetailComponent} from './components/object-detail-container/tabs/object-detail/object-detail.component';
import {ButtonModule, IconModule, InputModule, LoadingModule, ModalModule} from 'carbon-components-angular';
import {ReactiveFormsModule} from '@angular/forms';
import {TooltipIconModule} from '@valtimo/user-interface';

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
    IconModule,
    SpinnerModule,
    LoadingModule,
    ModalModule,
    ReactiveFormsModule,
    InputModule,
    TooltipIconModule,
    ConfirmationModalModule
  ],
  exports: [
  ]
})
export class ObjectModule { }
