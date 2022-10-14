import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule, FormModule, InputModule} from '@valtimo/user-interface';
import {PluginTranslatePipeModule} from '@valtimo/plugin';
import {ExactPluginRoutingModule} from './exact-plugin-routing.module';
import {ExactGetRequestConfigurationComponent} from './components/exact-action-get-request-configuration/exact-get-request-configuration.component';
import {ExactPostRequestConfigurationComponent} from './components/exact-action-post-request-configuration/exact-post-request-configuration.component';
import {ExactPutRequestConfigurationComponent} from './components/exact-action-put-request-configuration/exact-put-request-configuration.component';
import {ExactPluginConfigurationComponent} from './components/exact-plugin-configuration/exact-plugin-configuration.component';
import {ExactRedirectComponent} from './components/exact-redirect/exact-redirect.component';

@NgModule({
  declarations: [
    ExactGetRequestConfigurationComponent, ExactPostRequestConfigurationComponent, ExactPutRequestConfigurationComponent, ExactPluginConfigurationComponent, ExactRedirectComponent
  ],
  imports: [
    CommonModule, ExactPluginRoutingModule, PluginTranslatePipeModule, FormModule, InputModule, ButtonModule, ExactPluginRoutingModule
  ],
  exports: []
})
export class ExactPluginModule {
}
