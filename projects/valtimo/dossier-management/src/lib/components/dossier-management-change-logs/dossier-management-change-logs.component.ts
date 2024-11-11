import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {CarbonListModule, ColumnConfig, ViewType} from '@valtimo/components';
import {CaseChangeLogsService} from '../../services';
import {Observable, map} from 'rxjs';
import {CaseChangeLog} from '../../models';

@Component({
  selector: 'valtimo-dossier-management-change-logs',
  templateUrl: './dossier-management-change-logs.component.html',
  styleUrl: './dossier-management-change-logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CarbonListModule],
})
export class DossierManagementChangeLogsComponent {
  public readonly caseChangeLogs$: Observable<(CaseChangeLog & {fullName: string})[] | null> =
    this.caseChangeLogsService.caseChangeLogs$.pipe(
      map((changeLogs: CaseChangeLog[] | null) =>
        !!changeLogs
          ? changeLogs.map((changeLog: CaseChangeLog) => ({
              ...changeLog,
              fullName: `${changeLog.user.firstName} ${changeLog.user.lastName}`,
            }))
          : null
      )
    );
  public readonly CASE_CHANGE_LOGS_FIELDS: ColumnConfig[] = [
    {
      key: 'fullName',
      label: 'User name',
      viewType: ViewType.TEXT,
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      viewType: ViewType.DATE_TIME,
    },
    {
      key: 'message',
      label: 'Message',
      viewType: ViewType.TEXT,
    },
  ];

  constructor(private readonly caseChangeLogsService: CaseChangeLogsService) {}
}
