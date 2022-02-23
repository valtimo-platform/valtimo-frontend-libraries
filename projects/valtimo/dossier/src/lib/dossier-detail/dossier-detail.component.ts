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

import {
  Component,
  ComponentFactoryResolver,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {DocumentService, Document, ProcessDocumentDefinition} from '@valtimo/document';
import {TabLoaderImpl} from '../models';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';
import {TabService} from '../tab.service';
import {ProcessService} from '@valtimo/process';
import {DossierSupportingProcessStartModalComponent} from '../dossier-supporting-process-start-modal/dossier-supporting-process-start-modal.component';
import {ConfigService} from '@valtimo/config'

@Component({
  selector: 'valtimo-dossier-detail',
  templateUrl: './dossier-detail.component.html',
  styleUrls: ['./dossier-detail.component.css'],
})
export class DossierDetailComponent implements OnInit {
  @ViewChild('tabContainer', {read: ViewContainerRef, static: true})
  viewContainerRef: ViewContainerRef;

  public documentDefinitionName: string;
  public documentDefinitionNameTitle: string;
  public documentId: string;
  public document: Document = null;
  public tabLoader: TabLoaderImpl = null;
  private snapshot: ParamMap;
  public processDefinitionListFields: Array<any> = [];
  public processDocumentDefinitions: ProcessDocumentDefinition[] = [];
  private initialTabName: string;
  public customDossierHeaderItems: Array<any> = [];
  @ViewChild('supportingProcessStartModal')
  supportingProcessStart: DossierSupportingProcessStartModalComponent;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private translateService: TranslateService,
    private documentService: DocumentService,
    private processService: ProcessService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private tabService: TabService,
    private configService: ConfigService
  ) {
    this.snapshot = this.route.snapshot.paramMap;
    this.documentDefinitionName = this.snapshot.get('documentDefinitionName') || '';
    this.documentId = this.snapshot.get('documentId') || '';
  }

  ngOnInit() {
    this.tabLoader = new TabLoaderImpl(
      this.tabService.getTabs(),
      this.componentFactoryResolver,
      this.viewContainerRef,
      this.translateService,
      this.router,
      this.location
    );
    this.documentService
      .getDocumentDefinition(this.documentDefinitionName)
      .subscribe(definition => {
        this.documentDefinitionNameTitle = definition.schema.title;
      });
    this.getCustomHeaderTitle();
    this.initialTabName = this.snapshot.get('tab');
    this.tabLoader.initial(this.initialTabName);
    this.getAllAssociatedProcessDefinitions();
  }

  public getAllAssociatedProcessDefinitions() {
    this.documentService
      .findProcessDocumentDefinitions(this.documentDefinitionName)
      .subscribe(processDocumentDefinitions => {
        this.processDocumentDefinitions = processDocumentDefinitions.filter(
          processDocumentDefinition => processDocumentDefinition.startableByUser
        );
        this.processDefinitionListFields = [
          {
            key: 'processName',
            label: 'Proces',
          },
        ];
      });
  }

  startProcess(processDocumentDefinition: ProcessDocumentDefinition) {
    this.supportingProcessStart.openModal(processDocumentDefinition, this.documentId);
  }

  private getCustomHeaderTitle() {
    let customDossierHeaderItems = this.configService.config['customDossierHeader'][this.documentDefinitionName.toLowerCase()] || [];
    if (customDossierHeaderItems.length > 0) {
      console.log('$$$$$$$$$$$$$$$$$$$$$');
      this.documentService.getDocument(this.documentId).subscribe(document => {
        this.document = document;
        for (let i in customDossierHeaderItems) {
          let label = customDossierHeaderItems[i]['label'] || '';
          let value = '';
          for (let val of customDossierHeaderItems[i]['propertyPaths'] || '') {
            value += val.split('.').reduce((o, i) => o[i], this.document.content) || customDossierHeaderItems[i]['noValueText'] || '';
            value += ' ';
          }
          let columnSize = customDossierHeaderItems[i]['columnSize'] || 3;
          let textSize = customDossierHeaderItems[i]['textSize'] || 'md';
          let customClass = customDossierHeaderItems[i]['customClass'] || '';
          this.customDossierHeaderItems.push({
            'label': label,
            'value': value,
            'columnSize': columnSize,
            'textSize': textSize,
            'customClass': customClass,
          });
        }
      })
    }
  }
}
