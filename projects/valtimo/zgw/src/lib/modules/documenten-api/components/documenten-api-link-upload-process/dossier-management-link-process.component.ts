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
import {Component, OnInit} from '@angular/core';
import {ConfigService, UploadProvider, ValtimoConfig} from '@valtimo/config';
import {BehaviorSubject, map, Observable, switchMap} from 'rxjs';
import {ParagraphModule, SelectItem, SelectModule} from '@valtimo/components';
import {ProcessService} from '@valtimo/process';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
import {filter} from 'rxjs/operators';
import {DocumentenApiLinkProcessService} from '../../services';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'valtimo-dossier-management-link-process',
  templateUrl: './dossier-management-link-process.component.html',
  standalone: true,
  imports: [CommonModule, ParagraphModule, SelectModule, TranslateModule],
})
export class DossierManagementLinkProcessComponent implements OnInit {
  public readonly documentenApiUploadProviders$ = new BehaviorSubject<boolean>(false);

  private readonly _documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params?.name),
    filter(name => !!name)
  );

  public readonly selectionId$ = new BehaviorSubject<string>('');
  public readonly processItems$: Observable<Array<SelectItem>> = this.processService
    .getProcessDefinitions()
    .pipe(
      map(definitions => definitions.filter(definition => !!definition?.key) || []),
      map(processes => processes.map(process => ({text: process?.name || '-', id: process.key})))
    );

  public readonly disabled$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly configService: ConfigService,
    private readonly processService: ProcessService,
    private readonly route: ActivatedRoute,
    private readonly documentenApiLinkProcessService: DocumentenApiLinkProcessService
  ) {}

  public ngOnInit(): void {
    this.setDocumentenApiUploaderProvider(this.configService.config);
  }

  public selectProcess(processDefinitionKey: string): void {
    console.log(processDefinitionKey);
    this.disabled$.next(true);
    const currentSelectionId = this.selectionId$.getValue();
    if (
      !Array.isArray(processDefinitionKey) &&
      processDefinitionKey &&
      processDefinitionKey !== currentSelectionId
    ) {
      this.disabled$.next(true);
      this._documentDefinitionName$
        .pipe(
          switchMap(documentDefinitionName =>
            this.documentenApiLinkProcessService.updateLinkedUploadProcess(
              documentDefinitionName,
              processDefinitionKey
            )
          )
        )
        .subscribe(processLink => {
          this.selectionId$.next(processLink.processDefinitionKey);
          this.disabled$.next(false);
        });
    } else if (
      !processDefinitionKey ||
      (Array.isArray(processDefinitionKey) && processDefinitionKey.length === 0)
    ) {
      this._documentDefinitionName$
        .pipe(
          switchMap(documentDefinitionName =>
            this.documentenApiLinkProcessService.deleteLinkedUploadProcess(documentDefinitionName)
          )
        )
        .subscribe(() => {
          this.disabled$.next(false);
        });
    }
  }

  private setDocumentenApiUploaderProvider(config: ValtimoConfig): void {
    const hasDocumentenApiUploadProvider = config.uploadProvider === UploadProvider.DOCUMENTEN_API;

    this.documentenApiUploadProviders$.next(hasDocumentenApiUploadProvider);
    if (hasDocumentenApiUploadProvider) this.getDefaultSelection();
  }

  private getDefaultSelection(): void {
    this._documentDefinitionName$
      .pipe(
        switchMap(documentDefinitionName =>
          this.documentenApiLinkProcessService.getLinkedUploadProcess(documentDefinitionName)
        )
      )
      .subscribe(linkedUploadProcess => {
        if (linkedUploadProcess) {
          this.selectionId$.next(linkedUploadProcess.processDefinitionKey);
        }
      });
  }
}
