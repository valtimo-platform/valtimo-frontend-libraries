/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DossierRoutingModule} from './dossier-routing.module';
import {DossierListComponent} from './dossier-list/dossier-list.component';
import {DossierService} from './dossier.service';
import {TAB_MAP} from './dossier.config';
import {HttpLoaderFactory} from '@valtimo/config';
import {
  BpmnJsDiagramModule,
  CamundaFormModule,
  DataListModule,
  FilterSidebarModule,
  FormIoModule,
  ListModule,
  ModalModule,
  SpinnerModule,
  TimelineModule,
  UploaderModule,
  WidgetModule,
  DropzoneModule,
} from '@valtimo/components';
import {DossierDetailComponent} from './dossier-detail/dossier-detail.component';
import {DossierDetailTabSummaryComponent} from './dossier-detail/tab/summary/summary.component';
import {DossierUpdateComponent} from './dossier-update/dossier-update.component';
import {DossierDetailTabProgressComponent} from './dossier-detail/tab/progress/progress.component';
import {ProcessModule} from '@valtimo/process';
import {DossierDetailTabAuditComponent} from './dossier-detail/tab/audit/audit.component';
import {DossierDetailTabContactMomentsComponent} from './dossier-detail/tab/contact-moments/contact-moments.component';
import {DossierDetailTabDocumentsComponent} from './dossier-detail/tab/documents/documents.component';
import {NgbButtonsModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {DossierProcessStartModalComponent} from './dossier-process-start-modal/dossier-process-start-modal.component';
import {FormModule} from '@valtimo/form';
import {FormsModule} from '@angular/forms';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {TabService} from './tab.service';
import {TaskModule} from '@valtimo/task';
import {DossierSupportingProcessStartModalComponent} from './dossier-supporting-process-start-modal/dossier-supporting-process-start-modal.component';
import {NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import {ConfigModule} from '@valtimo/config';

export type TabsFactory = () => Map<string, object>;

@NgModule({
  declarations: [
    DossierListComponent,
    DossierDetailComponent,
    DossierDetailTabSummaryComponent,
    DossierDetailTabProgressComponent,
    DossierDetailTabAuditComponent,
    DossierDetailTabDocumentsComponent,
    DossierDetailTabContactMomentsComponent,
    DossierUpdateComponent,
    DossierProcessStartModalComponent,
    DossierSupportingProcessStartModalComponent,
  ],
  imports: [
    CommonModule,
    DossierRoutingModule,
    ListModule,
    WidgetModule,
    BpmnJsDiagramModule,
    TimelineModule,
    CamundaFormModule,
    ProcessModule,
    FilterSidebarModule,
    NgbButtonsModule,
    DataListModule,
    FormsModule,
    FormModule,
    FormIoModule,
    ModalModule,
    SpinnerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    TaskModule,
    ModalModule,
    NgbTooltipModule,
    UploaderModule,
    DropzoneModule,
    NgbPaginationModule,
    ConfigModule,
  ],
  exports: [DossierListComponent, DossierDetailComponent],
})
export class DossierModule {
  static forRoot(tabsFactory: TabsFactory): ModuleWithProviders<DossierModule> {
    return {
      ngModule: DossierModule,
      providers: [
        DossierService,
        TabService,
        {
          provide: TAB_MAP,
          useFactory: tabsFactory,
        },
        {
          provide: ANALYZE_FOR_ENTRY_COMPONENTS,
          useValue: Array.from(tabsFactory().values()),
          multi: true,
        },
      ],
    };
  }
}
