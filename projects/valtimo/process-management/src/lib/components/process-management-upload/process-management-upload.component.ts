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

import {Component, ElementRef, ViewChild} from '@angular/core';
import {ProcessManagementService} from '../../process-management.service';
import {AlertService} from '@valtimo/components';
import {ProcessManagementStateService} from '../../services';

@Component({
  selector: 'valtimo-process-management-upload',
  templateUrl: './process-management-upload.component.html',
  styleUrls: ['./process-management-upload.component.scss'],
})
export class ProcessManagementUploadComponent {
  public bpmn: File | null = null;
  @ViewChild('bpmnFile') bpmnFile: ElementRef;

  public readonly modalOpen$ = this.processManagementStateService.openModal$;

  constructor(
    private readonly processManagementService: ProcessManagementService,
    private readonly alertService: AlertService,
    private readonly processManagementStateService: ProcessManagementStateService
  ) {}

  public closeModal(): void {
    this.processManagementStateService.closeModal();
  }

  public onChange(files: FileList): void {
    this.bpmn = files.item(0);
  }

  public uploadProcessBpmn(): void {
    this.processManagementService.deployBpmn(this.bpmn).subscribe({
      next: () => {
        this.bpmn = null;
        this.bpmnFile.nativeElement.value = '';
        this.alertService.success('Deployment successful');
        this.processManagementStateService.closeModal();
        this.processManagementStateService.reloadDefinitions();
      },
      error: error => {
        this.bpmn = null;
        this.bpmnFile.nativeElement.value = '';
        this.alertService.error(`Deployment failed. ${error}`);
      },
    });
  }
}
