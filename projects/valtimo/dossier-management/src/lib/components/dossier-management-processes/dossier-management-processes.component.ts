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
import {ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {AlertService, ColumnConfig, ViewType} from '@valtimo/components';
import {DocumentDefinition, DocumentService, ProcessDocumentDefinition} from '@valtimo/document';
import {BehaviorSubject, Observable, switchMap} from 'rxjs';
import {DossierManagementConnectModalComponent} from '../dossier-management-connect-modal/dossier-management-connect-modal.component';

@Component({
  selector: 'valtimo-dossier-management-processes',
  templateUrl: './dossier-management-processes.component.html',
  styleUrls: ['./dossier-management-processes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DossierManagementProcessesComponent {
  @ViewChild('dossierConnectModal')
  private readonly _dossierConnectModal: DossierManagementConnectModalComponent;

  private readonly _refresh$ = new BehaviorSubject<null>(null);
  public readonly processDocumentDefinitions$: Observable<ProcessDocumentDefinition[]> =
    this._refresh$.pipe(
      switchMap(() => this.route.paramMap),
      switchMap((params: ParamMap) =>
        this.documentService.findProcessDocumentDefinitions(params.get('name') ?? '')
      )
    );

  public readonly documentDefinition$ = this.route.paramMap.pipe(
    switchMap((params: ParamMap) =>
      this.documentService.getDocumentDefinitionForManagement(params.get('name') ?? '')
    )
  );

  public readonly fields: ColumnConfig[] = [
    {
      key: 'processName',
      label: 'interface.name',
      viewType: ViewType.TEXT,
    },
    {
      key: 'canInitializeDocument',
      label: 'processCaseConnection.processCreatesCase',
      viewType: ViewType.BOOLEAN,
    },
    {
      key: 'startableByUser',
      label: 'processCaseConnection.startableWithinCase',
      viewType: ViewType.BOOLEAN,
    },
    {
      key: '',
      label: '',
      viewType: ViewType.ACTION,
      className: 'dossier-management-processes_actions',
      actions: [
        {
          label: 'interface.delete',
          callback: this.deleteProcessDocumentDefinition.bind(this),
          type: 'danger',
        },
      ],
    },
  ];

  constructor(
    private readonly alertService: AlertService,
    private readonly documentService: DocumentService,
    private readonly route: ActivatedRoute
  ) {}

  public deleteProcessDocumentDefinition(
    processDocumentDefinition: ProcessDocumentDefinition
  ): void {
    this.documentService
      .deleteProcessDocumentDefinition({
        documentDefinitionName: processDocumentDefinition.id.documentDefinitionId.name,
        processDefinitionKey: processDocumentDefinition.id.processDefinitionKey,
        canInitializeDocument: processDocumentDefinition.canInitializeDocument,
        startableByUser: processDocumentDefinition.startableByUser,
      })
      .subscribe({
        next: () => {
          this.alertService.success('Successfully deleted process document definition');
          this.loadProcessDocumentDefinitions();
        },
        error: () => {
          this.alertService.error('Failed to delete process document definition');
        },
      });
  }

  public loadProcessDocumentDefinitions(): void {
    this._refresh$.next(null);
  }

  public openDossierConnectModal(documentDefinition: DocumentDefinition): void {
    this._dossierConnectModal.openModal(documentDefinition);
  }
}
