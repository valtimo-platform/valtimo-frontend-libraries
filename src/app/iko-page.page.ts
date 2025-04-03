import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {IkoKlantPageComponent} from '@valtimo/dossier';
import {FormModule, InputModule} from '@valtimo/components';
import {TranslateModule} from '@ngx-translate/core';
import {ButtonModule} from 'carbon-components-angular';

@Component({
  templateUrl: 'iko-page.page.html',
  standalone: true,
  imports: [IkoKlantPageComponent, FormModule, TranslateModule, InputModule, ButtonModule],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class IkoPagePage {
  bsn: string = '999993653';
  searched: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  changeBsn(bsn) {
    this.bsn = bsn.srcElement.value;
  }

  search() {
    this.searched = false;
    this.router
      .navigate(['.'], {
        relativeTo: this.route,
        queryParams: {
          bsn: this.bsn,
        },
      })
      .then(() => setTimeout(() => (this.searched = true), 500));
  }
}
