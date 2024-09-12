/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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

import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ProcessDefinition, ProcessService} from '@valtimo/process';
import {AlertService, ModalService, PageTitleService} from '@valtimo/components';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, forkJoin, Observable} from 'rxjs';
import {LayoutService} from '@valtimo/layout';
import Modeler from 'bpmn-js/lib/Modeler';
import BpmnViewer from 'bpmn-js';
import {BpmnPropertiesPanelModule, BpmnPropertiesProviderModule, CamundaPlatformPropertiesProviderModule} from 'bpmn-js-properties-panel';
import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda.json';
import camundaPlatformBehaviors from 'camunda-bpmn-js-behaviors/lib/camunda-platform';
import magicPropertiesProviderModule from './customizer';
import {ProcessLinkService, ProcessLinkStateService,} from '@valtimo/process-link';
import {ProcessManagementService} from '../process-management.service';

@Component({
  selector: 'valtimo-process-management-builder',
  templateUrl: './process-management-builder.component.html',
  styleUrls: ['./process-management-builder.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProcessManagementBuilderComponent implements OnInit, OnDestroy {
  public bpmnModeler;
  public bpmnViewer;
  public processDefinitionVersions: ProcessDefinition[] | null = null;
  public selectedVersion: ProcessDefinition | null = null;
  public processKey: string | null = null;
  public isReadOnlyProcess$ = new BehaviorSubject<boolean>(false);
  public isSystemProcess$ = new BehaviorSubject<boolean>(false);
  private elementTemplateFiles: string[] = ['mailSendTask'];

  constructor(
    private readonly http: HttpClient,
    private readonly processService: ProcessService,
    public readonly layoutService: LayoutService,
    private readonly alertService: AlertService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly pageTitleService: PageTitleService,

    private readonly modalService: ModalService,
    private readonly stateService: ProcessLinkStateService,
    private readonly processLinkService: ProcessLinkService,
    private readonly processManagementService: ProcessManagementService
  ) {
    (window as any).modalService = modalService;
    (window as any).stateService = stateService;
    (window as any).processLinkService = processLinkService;
  }

  ngOnInit() {
    this.init();
  }

  init() {
    this.processKey = this.route.snapshot.paramMap.get('key');
    forkJoin(this.getElementTemplates()).subscribe((elementTemplates: any[]) => {

      this.bpmnModeler = new Modeler({
        container: '#canvas',
        height: '90vh',
        valtimoRenderer: {
          test: 'test'
        },
        additionalModules: [
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          CamundaPlatformPropertiesProviderModule,
          camundaPlatformBehaviors,
          magicPropertiesProviderModule
        ],
        propertiesPanel: {
          parent: '#properties',
        },
        moddleExtensions: {
          camunda: CamundaBpmnModdle
        },
        elementTemplates,
      });
      this.bpmnViewer = new BpmnViewer();
      this.bpmnViewer.attachTo('#readOnlyCanvas');
      if (this.processKey) {
        this.loadProcessVersions(this.processKey);
        this.selectedVersion = null;
      } else {
        this.loadEmptyBpmn();
      }
    });
  }

  deploy(): void {
    this.bpmnModeler.saveXML((err: any, xml: any) => {
      this.processService.deployProcess(xml).subscribe(asd => {
        if (this.processKey) {
          this.loadProcessVersions(this.processKey);
        } else {
          this.router.navigate(['/processes']);
        }
        this.alertService.success('Deployment successful');
        this.selectedVersion = null;
      });
    });
  }

  reset() {
    this.bpmnModeler.destroy();
    this.bpmnViewer.destroy();
    this.init();
  }

  download() {
    this.bpmnModeler.saveXML((err: any, xml: any) => {
      const file = new Blob([xml], {type: 'text/xml'});
      const link = document.createElement('a');
      link.download = 'diagram.bpmn';
      link.href = window.URL.createObjectURL(file);
      link.click();
      window.URL.revokeObjectURL(link.href);
      link.remove();
    });
  }

  loadEmptyBpmn() {
    const url = '/assets/bpmn/initial.bpmn';
    this.http
      .get(url, {
        headers: {observe: 'response'},
        responseType: 'text',
      })
      .subscribe((xml: any) => {
        this.bpmnModeler.importXML(xml);
        this.bpmnViewer.importXML(xml);
      });
  }

  getElementTemplates(): Observable<any>[] {
    const templateObs = [];
    for (const file of this.elementTemplateFiles) {
      templateObs.push(
        this.http.get(`/assets/bpmn/element-templates/${file}.json`, {
          headers: {observe: 'response'},
          responseType: 'json',
        })
      );
    }
    return templateObs;
  }

  private setLatestVersion() {
    this.selectedVersion = this.processDefinitionVersions.reduce((acc, version) =>
      version.version > acc.version ? version : acc
    );
    this.loadProcessBpmn();
    (window as any).processLinks = this.processManagementService.getProcessLinks(this.selectedVersion.id);
  }

  loadProcessVersions(processDefinitionKey: string) {
    this.processService
      .getProcessDefinitionVersions(processDefinitionKey)
      .subscribe((processDefinitionVersions: ProcessDefinition[]) => {
        this.processDefinitionVersions = processDefinitionVersions;
        this.pageTitleService.setCustomPageTitle(
          processDefinitionVersions[processDefinitionVersions.length - 1].name
        );
        this.setLatestVersion();
      });
  }

  compareProcessDefinitions(pd1: ProcessDefinition, pd2: ProcessDefinition) {
    if (pd1 === null && pd2 === null) {
      return true;
    }
    if (pd1 === null || pd2 === null) {
      return false;
    }
    return pd1.id === pd2.id;
  }

  loadProcessBpmn() {
    this.processService.getProcessDefinitionXml(this.selectedVersion.id).subscribe(result => {
      this.bpmnModeler.importXML(result['bpmn20Xml']);
      this.bpmnViewer.importXML(result['bpmn20Xml']);
      this.isReadOnlyProcess$.next(result.readOnly);
      this.isSystemProcess$.next(result.systemProcess);
    });
  }

  ngOnDestroy() {
    this.bpmnModeler.destroy();
    this.bpmnViewer.destroy();
  }
}
