/*
 * Copyright 2015-2023 Ritense BV, the Netherlands.
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

import {Component, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {DocumentService, ProcessDocumentDefinition} from '@valtimo/document';
import {FormAssociation, FormFlowService, FormLinkService, FormSubmissionResult} from '@valtimo/form-link';
import {ActivatedRoute, Router} from '@angular/router';
import {ProcessService} from '@valtimo/process';
import {FormioComponent, FormioOptionsImpl, FormioSubmission, ModalComponent, ValtimoFormioOptions,} from '@valtimo/components';
import {FormioBeforeSubmit} from '@formio/angular/formio.common';
import {FormioForm} from '@formio/angular';
import {NGXLogger} from 'ngx-logger';
import {UserProviderService} from '@valtimo/security';
import {take} from 'rxjs/operators';

@Component({
  selector: 'valtimo-dossier-process-start-modal',
  templateUrl: './dossier-process-start-modal.component.html',
  styleUrls: ['./dossier-process-start-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DossierProcessStartModalComponent implements OnInit {
  public processDefinitionKey: string;
  public documentDefinitionName: string;
  public processName: string;
  public formDefinition: FormioForm;
  public formFlowInstanceId: string;
  public formioSubmission: FormioSubmission;
  private formAssociation: FormAssociation;
  public options: ValtimoFormioOptions;
  public isAdmin: boolean;
  @ViewChild('form', {static: false}) form: FormioComponent;
  @ViewChild('processStartModal', {static: false}) modal: ModalComponent;
  @Output() formFlowComplete = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private processService: ProcessService,
    private documentService: DocumentService,
    private formLinkService: FormLinkService,
    private formFlowService: FormFlowService,
    private userProviderService: UserProviderService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.isUserAdmin();
  }

  private loadProcessLink() {
    this.formDefinition = null;
    this.formFlowInstanceId = null;
    this.processService.getProcessDefinitionStartProcessLink(this.processDefinitionKey)
      .pipe(take(1))
      .subscribe(startProcessResult => {
        if (startProcessResult) {
          switch (startProcessResult.type) {
            case 'form':
              this.formDefinition = startProcessResult.properties.prefilledForm
              break;
            case 'form-flow':
              this.formFlowInstanceId = startProcessResult.properties.formFlowInstanceId
              break;
          }
          this.modal.show();
        } else {
          // backwards compatibility for form associations
          this.formLinkService.getStartEventFormDefinitionByProcessDefinitionKey(this.processDefinitionKey, null)
            .pipe(take(1))
            .subscribe({
              next: formDefinitionWithFormAssociation => this.openFormAssociation(formDefinitionWithFormAssociation),
              error: error => {this.modal.show()}
            });
        }
      })
  }

  private openFormAssociation(formDefinitionWithFormAssociation: any) {
    this.formAssociation = formDefinitionWithFormAssociation.formAssociation;
    const className = this.formAssociation.formLink.className.split('.');
    const linkType = className[className.length - 1];
    switch (linkType) {
      case 'BpmnElementFormIdLink':
        this.formDefinition = formDefinitionWithFormAssociation;
        this.modal.show();
        break;
      case 'BpmnElementFormFlowIdLink':
        this.formFlowService.createInstanceForNewProcess(this.processDefinitionKey, {documentId: null})
          .subscribe(result => this.formFlowInstanceId = result.formFlowInstanceId)
        this.modal.show();
        break;
      case 'BpmnElementUrlLink':
        const url = this.router.serializeUrl(
          this.router.createUrlTree([this.formAssociation.formLink.url])
        );
        window.open(url, '_blank');
        break;
      case 'BpmnElementAngularStateUrlLink':
        this.route.params.pipe(take(1)).subscribe(params => {
          const documentId = params?.documentId;

          this.router.navigate([this.formAssociation.formLink.url], {
            state: {...(documentId && {documentId})},
          });
        });
        break;
      default:
        this.logger.fatal('Unsupported class name');
    }
  }

  public gotoFormLinkScreen() {
    this.modal.hide();
    this.router.navigate(['form-links'], {queryParams: {process: this.processDefinitionKey}});
  }

  public get modalTitle() {
    return `Start - ${this.processName}`;
  }

  openModal(processDocumentDefinition: ProcessDocumentDefinition) {
    this.processDefinitionKey = processDocumentDefinition.id.processDefinitionKey;
    this.documentDefinitionName = processDocumentDefinition.id.documentDefinitionId.name;
    this.processName = processDocumentDefinition.processName;
    this.options = new FormioOptionsImpl();
    this.options.disableAlerts = true;
    const formioBeforeSubmit: FormioBeforeSubmit = function (submission, callback) {
      callback(null, submission);
    };
    this.options.setHooks(formioBeforeSubmit);
    this.loadProcessLink();
  }

  public onSubmit(submission: FormioSubmission) {
    this.formioSubmission = submission;
    this.formLinkService
      .onSubmit(this.processDefinitionKey, this.formAssociation.formLink.id, submission.data)
      .subscribe(
        (formSubmissionResult: FormSubmissionResult) => {
          this.modal.hide();
          this.router.navigate([
            'dossiers',
            this.documentDefinitionName,
            'document',
            formSubmissionResult.documentId,
            'summary',
          ]);
        },
        errors => {
          this.form.showErrors(errors);
        }
      );
  }

  public formFlowSubmitted(): void {
    this.formFlowComplete.emit(null);
    this.modal.hide();
  }

  public isUserAdmin(): void {
    this.userProviderService.getUserSubject().subscribe(
      userIdentity => {
        this.isAdmin = userIdentity.roles.includes('ROLE_ADMIN');
      },
      error => {
        this.isAdmin = false;
      }
    );
  }
}
