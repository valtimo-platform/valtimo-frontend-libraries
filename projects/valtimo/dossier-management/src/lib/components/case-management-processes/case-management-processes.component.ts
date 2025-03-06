import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PendingChangesComponent} from '@valtimo/components';
import {
  ProcessManagementComponent,
  ProcessManagementStateService,
} from '@valtimo/process-management';
import {ButtonModule} from 'carbon-components-angular';
import {BehaviorSubject, map, tap} from 'rxjs';

@Component({
  templateUrl: './case-management-processes.component.html',
  styleUrl: './case-management-processes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, ButtonModule, ProcessManagementComponent],
  providers: [ProcessManagementStateService],
})
export class CaseManagementProcessesComponent extends PendingChangesComponent implements OnInit {
  public readonly selectedProcess$ = new BehaviorSubject<any | 'create' | null>(null);
  public readonly params$ = this.route.parent?.params.pipe(
    tap(params => console.log({params})),
    map(params => ({
      documentDefinitionKey: params['caseDefinitionName'],
      versionTag: params['caseVersionTag'],
    }))
  );

  constructor(private readonly route: ActivatedRoute) {
    super();
  }

  public ngOnInit(): void {
    console.log(this.route.parent?.snapshot);
  }

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
