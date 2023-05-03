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

import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {map, Observable, of, switchMap, tap} from 'rxjs';
import {DocumentService, ProcessDocumentDefinition} from '@valtimo/document';
import {DossierProcessStartModalComponent} from '../dossier-process-start-modal/dossier-process-start-modal.component';
import {ActivatedRoute} from '@angular/router';
import {DossierListService} from '../services';

declare const $;

@Component({
  selector: 'valtimo-dossier-list-actions',
  templateUrl: './dossier-list-actions.component.html',
  styleUrls: ['./dossier-list-actions.component.scss'],
})
export class DossierListActionsComponent implements OnInit {
  @ViewChild('processStartModal') processStart: DossierProcessStartModalComponent;

  @Input() loading!: boolean;

  @Output() formFlowComplete = new EventEmitter();

  private selectedProcessDocumentDefinition: ProcessDocumentDefinition | null = null;

  private modalListenerAdded = false;

  private _cachedAssociatedProcessDocumentDefinitions: Array<ProcessDocumentDefinition> = [];

  readonly associatedProcessDocumentDefinitions$: Observable<Array<ProcessDocumentDefinition>> =
    this.listService.documentDefinitionName$.pipe(
      switchMap(documentDefinitionName =>
        documentDefinitionName
          ? this.documentService.findProcessDocumentDefinitions(documentDefinitionName)
          : of([])
      ),
      map(processDocumentDefinitions =>
        processDocumentDefinitions.filter(definition => definition.canInitializeDocument)
      ),
      tap(processDocumentDefinitions => {
        this._cachedAssociatedProcessDocumentDefinitions = processDocumentDefinitions;
      })
    );

  constructor(
    private readonly documentService: DocumentService,
    private readonly route: ActivatedRoute,
    private readonly listService: DossierListService
  ) {}

  ngOnInit(): void {
    this.modalListenerAdded = false;
  }

  startDossier(): void {
    const associatedProcessDocumentDefinitions = this._cachedAssociatedProcessDocumentDefinitions;

    if (associatedProcessDocumentDefinitions.length > 1) {
      $('#startProcess').modal('show');
    } else {
      this.selectedProcessDocumentDefinition = associatedProcessDocumentDefinitions[0];
      this.showStartProcessModal();
    }
  }

  selectProcess(processDocumentDefinition: ProcessDocumentDefinition): void {
    const modal = $('#startProcess');
    if (!this.modalListenerAdded) {
      modal.on('hidden.bs.modal', this.showStartProcessModal.bind(this));
      this.modalListenerAdded = true;
    }
    this.selectedProcessDocumentDefinition = processDocumentDefinition;
    modal.modal('hide');
  }

  onFormFlowComplete() {
    this.formFlowComplete.emit(null)
  }

  private showStartProcessModal(): void {
    if (this.selectedProcessDocumentDefinition !== null) {
      this.processStart.openModal(this.selectedProcessDocumentDefinition);
      this.selectedProcessDocumentDefinition = null;
    }
  }
}
