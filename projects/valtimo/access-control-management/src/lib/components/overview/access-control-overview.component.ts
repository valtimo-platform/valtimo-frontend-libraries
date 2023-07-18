import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CarbonTableConfig, ColumnType, createCarbonTableConfig} from '@valtimo/components';
import {BehaviorSubject, finalize, Observable} from 'rxjs';
import {Role} from '../../models';
import {AccessControlService} from '../../services/access-control.service';

@Component({
  templateUrl: './access-control-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessControlOverviewComponent implements OnInit {
  public tableConfig: CarbonTableConfig = createCarbonTableConfig({
    fields: [
      {
        columnType: ColumnType.TEXT,
        fieldName: 'roleKey',
        translationKey: 'accessControl.roles.key',
      },
    ],
  });

  public readonly roles$: Observable<Role[]> = this.accessControlService.roles$;
  public readonly showAddModal$ = new BehaviorSubject<boolean>(false);
  public readonly showDeleteModal$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly accessControlService: AccessControlService) {}

  public ngOnInit(): void {
    this.accessControlService.loadRoles();
  }

  public openAddModal(): void {
    this.showAddModal$.next(true);
  }

  public onAdd(data: Role | null): void {
    this.showAddModal$.next(false);

    if (!data) {
      return;
    }

    this.accessControlService.dispatchAction(
      this.accessControlService.addRole(data).pipe(
        finalize(() => {
          this.showAddModal$.next(false);
        })
      )
    );
  }
}
