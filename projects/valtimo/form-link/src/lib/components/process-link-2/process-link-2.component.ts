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

import {Component} from '@angular/core';
import {ModalParams, ProcessLinkType} from '../../models';
import {
  ProcessLinkButtonService,
  ProcessLinkService,
  ProcessLinkStateService,
  ProcessLinkStepService,
} from '../../services';
import {of, switchMap, tap} from 'rxjs';

@Component({
  selector: 'valtimo-process-link-2',
  templateUrl: './process-link-2.component.html',
  styleUrls: ['./process-link-2.component.scss'],
  providers: [ProcessLinkStateService, ProcessLinkStepService, ProcessLinkButtonService],
})
export class ProcessLink2Component {
  constructor(
    private readonly processLinkService: ProcessLinkService,
    private readonly processLinkStateService: ProcessLinkStateService
  ) {}

  openModal(params: ModalParams): void {
    const activityType = params?.element?.activityListenerType;

    if (activityType) {
      this.processLinkService
        .getProcessLink({
          activityId: params.element.id,
          processDefinitionId: params.processDefinitionId,
        })
        .pipe(
          switchMap(processLinks => {
            if (processLinks.length > 0) {
              return of({processLink: processLinks[0]});
            } else {
              return this.processLinkService.getProcessLinkCandidates(activityType);
            }
          }),
          tap(res => {
            if ((res as any).processLink) {
              console.log('linked', (res as any).processLink);
            } else {
              this.processLinkStateService.setAvailableProcessLinkTypes(
                res as Array<ProcessLinkType>
              );
              this.processLinkStateService.setModalParams(params);
              this.processLinkStateService.setElementName(params?.element?.name);
              this.processLinkStateService.showModal();
            }
          })
        )
        .subscribe();
    }
  }
}
