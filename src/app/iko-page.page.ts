import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DossierListSearchService, DossierService, IkoKlantPageComponent} from '@valtimo/dossier';
import {FormModule, InputModule} from '@valtimo/components';
import {TranslateModule} from '@ngx-translate/core';
import {ButtonModule} from 'carbon-components-angular';
import {DocumentenApiService} from '@valtimo/plugin/lib/plugins/documenten-api/services';
import {DocumentenApiDocumentService} from '@valtimo/zgw';
import {DossierDetailService} from '@valtimo/dossier-management';
import {DocumentService} from '@valtimo/document';
import {AdvancedDocumentSearchRequestImpl} from '../../projects/valtimo/document/src/lib/models';

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
    private route: ActivatedRoute,
    private dossier: DocumentService

  ) {
    this.dossier.getDocumentsSearch(
      new AdvancedDocumentSearchRequestImpl(
        "bezwaar", 0, 10
      )
    ).subscribe((v) => {
      if (v.content.length > 0) {
        this.router.navigate(['klant', 'bezwaard', 'document', v.content[0].id, 'widgets'], {
          queryParams: {
            bsn: this.bsn
          }
        })
      }
    })
    // /bezwaar/document/8ce5dd3c-c4f8-4956-946d-ef05e8d70c1f/widgets
  }

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
