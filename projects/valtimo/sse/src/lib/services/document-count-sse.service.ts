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

import {Injectable, OnDestroy} from '@angular/core';
import {startWith, Subject, Subscription} from 'rxjs';
import {DocumentCounts, DocumentCountService} from '@valtimo/components';
import {DocumentService} from '@valtimo/document';
import {SseService} from './sse.service';

@Injectable({
  providedIn: 'root',
})
export class DocumentCountSseService implements DocumentCountService, OnDestroy {
  private _sseSubscription!: Subscription;

  constructor(
    private readonly documentService: DocumentService,
    private readonly sseService: SseService
  ) {}

  ngOnDestroy(): void {
    this._sseSubscription?.unsubscribe();
  }

  getDocumentCounts(documentDefinitionNames: Array<string>): DocumentCounts {
    const documentCounts = {};

    documentDefinitionNames.forEach(documentDefinitionName => {
      documentCounts[documentDefinitionName] = new Subject<number>();
    });

    this.sseService
      .getSseMessagesObservableByEventType(['CASE_UNASSIGNED', 'CASE_ASSIGNED', 'CASE_CREATED'])
      .pipe(startWith(null))
      .subscribe(() => {
        this.documentService.getOpenDocumentCount().subscribe(openDocumentCountList => {
          openDocumentCountList.forEach(openDocumentCount => {
            if (documentCounts[openDocumentCount.documentDefinitionName]) {
              documentCounts[openDocumentCount.documentDefinitionName].next(
                openDocumentCount.openDocumentCount
              );
            }
          });
        });
      });

    return documentCounts;
  }
}
