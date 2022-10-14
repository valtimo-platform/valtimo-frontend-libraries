import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthGuardService} from '@valtimo/security';
import {ROLE_ADMIN} from '@valtimo/config';
import {ExactRedirectComponent} from './components/exact-redirect/exact-redirect.component';

const routes: Routes = [
  {
    path: 'plugins/exact/redirect',
    component: ExactRedirectComponent,
    canActivate: [AuthGuardService],
    data: {title: 'Exact Redirect', roles: [ROLE_ADMIN]},
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExactPluginRoutingModule {}
