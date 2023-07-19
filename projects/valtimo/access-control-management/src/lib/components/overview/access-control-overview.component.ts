import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CarbonTableConfig, ColumnType, createCarbonTableConfig} from '@valtimo/components';
import {BehaviorSubject, finalize, Observable, take} from 'rxjs';
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
  public readonly deleteRowKey$ = new BehaviorSubject<string>('');

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

  public showDeleteModal(): void {
    this.roles$.pipe(take(1)).subscribe(roles => {
      this.deleteRowKey$.next(roles[roles.length - 1].roleKey);
      this.showDeleteModal$.next(true);
    });
  }

  public onDelete(roleKey: string): void {
    console.log('delete', roleKey);
  }
}
