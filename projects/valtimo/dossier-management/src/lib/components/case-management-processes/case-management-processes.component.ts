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
import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PendingChangesComponent} from '@valtimo/components';
import {
  ProcessManagementComponent,
  ProcessManagementParams,
  ProcessManagementStateService,
} from '@valtimo/process-management';
import {ButtonModule} from 'carbon-components-angular';
<<<<<<< HEAD
import {map, Observable} from 'rxjs';
=======
import {BehaviorSubject, map, tap} from 'rxjs';
>>>>>>> 0fd4d99f (Add version to routing)

@Component({
  templateUrl: './case-management-processes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ButtonModule, ProcessManagementComponent],
  providers: [ProcessManagementStateService],
})
<<<<<<< HEAD
export class CaseManagementProcessesComponent extends PendingChangesComponent {
  public readonly params$: Observable<ProcessManagementParams> | undefined =
    this.route.parent?.params.pipe(
      map(({caseDefinitionName, caseVersionTag}) => ({
        definitionName: caseDefinitionName,
        versionTag: caseVersionTag,
      }))
    );
=======
export class CaseManagementProcessesComponent extends PendingChangesComponent implements OnInit {
  public readonly selectedProcess$ = new BehaviorSubject<any | 'create' | null>(null);
  public readonly params$ = this.route.parent?.params.pipe(
    tap(params => console.log({params})),
    map(params => ({
      documentDefinitionKey: params['caseDefinitionName'],
      versionTag: params['caseVersionTag'],
    }))
  );
>>>>>>> 0fd4d99f (Add version to routing)

  constructor(private readonly route: ActivatedRoute) {
    super();
  }

<<<<<<< HEAD
  //TODO Check for changes in process
=======
  public ngOnInit(): void {
    console.log(this.route.parent?.snapshot);
  }

>>>>>>> 0fd4d99f (Add version to routing)
  public onActivatePendingChanges(): void {
    this.pendingChanges = true;
  }

  public onDeactivatePendingChanges(): void {
    this.pendingChanges = false;
  }

  public onProcessSelected(process: any | 'create'): void {
    this.selectedProcess$.next(process);
  }
}
