import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PendingChangesComponent} from '@valtimo/components';
import {
  ProcessManagementComponent,
  ProcessManagementStateService,
} from '@valtimo/process-management';
import {ButtonModule} from 'carbon-components-angular';
import {map} from 'rxjs';

@Component({
  templateUrl: './case-management-processes.component.html',
  styleUrl: './case-management-processes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ButtonModule, ProcessManagementComponent],
  providers: [ProcessManagementStateService],
})
export class CaseManagementProcessesComponent extends PendingChangesComponent {
  public readonly params$ = this.route.parent?.params.pipe(
    map(({caseDefinitionName, caseVersionTag}) => ({
      caseDefinitionName,
      caseVersionTag,
    }))
  );

  constructor(private readonly route: ActivatedRoute) {
    super();
  }

  //TODO Check for changes in process
  public onActivatePendingChanges(): void {
    this.pendingChanges = true;
  }

  public onDeactivatePendingChanges(): void {
    this.pendingChanges = false;
  }
}
