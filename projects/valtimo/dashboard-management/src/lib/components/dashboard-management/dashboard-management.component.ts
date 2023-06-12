import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CarbonTableConfig, ColumnType, createCarbonTableConfig} from '@valtimo/components';
import {ROLE_ADMIN, ROLE_DEVELOPER, ROLE_USER} from '@valtimo/config';
import {ListItem} from 'carbon-components-angular';
import {BehaviorSubject} from 'rxjs';

import {dashboardListMock} from '../../mocks/dashboard-list.mock';
import {DashboardItem} from '../../models';

@Component({
  templateUrl: './dashboard-management.component.html',
  styleUrls: ['./dashboard-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardManagementComponent implements OnInit {
  public readonly openModal$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private data: Array<DashboardItem> = dashboardListMock;
  public readonly tableData$: BehaviorSubject<Array<DashboardItem>> = new BehaviorSubject<
    Array<DashboardItem>
  >(this.data);
  public tableConfig: CarbonTableConfig = createCarbonTableConfig({
    fields: [
      {
        columnType: ColumnType.TEXT,
        fieldName: 'name',
        fieldLabel: 'Name',
      },
      {
        columnType: ColumnType.TEXT,
        fieldName: 'description',
        fieldLabel: 'Description',
      },
      {
        columnType: ColumnType.TEXT,
        fieldName: 'roles',
        fieldLabel: 'Roles',
      },
      {
        columnType: ColumnType.TEXT,
        fieldName: 'key',
        fieldLabel: 'Key',
      },
      {
        columnType: ColumnType.ACTION,
        fieldName: '',
        fieldLabel: '',
        actions: [
          {
            actionName: 'Delete',
            callback: this.deleteDashboard.bind(this),
          },
        ],
      },
    ],
    searchable: true,
  });
  public readonly roleItems$: BehaviorSubject<ListItem[]> = new BehaviorSubject<ListItem[]>([
    {
      content: ROLE_ADMIN,
      selected: false,
    },
    {
      content: ROLE_DEVELOPER,
      selected: false,
    },
    {
      content: ROLE_USER,
      selected: false,
    },
  ]);
  public form: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      description: this.fb.control(''),
      name: this.fb.control('', [Validators.required]),
      roles: this.fb.control([]),
    });
  }

  public closeModal(): void {
    this.openModal$.next(false);
  }

  public createDashboard(): void {
    const control: AbstractControl | null = this.form.get('name');
    if (!control || !control.valid) {
      return;
    }

    const newDashboard: DashboardItem = {
      key: `test-id${this.data.length + 1}`,
      name: this.form.get('name')?.value,
      description: this.form.get('description')?.value,
      roles: this.form
        .get('roles')
        ?.value.map((item: ListItem) => item.content)
        .toString(),
    };

    this.data = [...this.data, newDashboard];
    console.log(this.data);
    this.tableData$.next(this.data);

    this.closeModal();
  }

  public openModal(): void {
    this.openModal$.next(true);
  }

  private deleteDashboard(dashboard: DashboardItem): void {
    this.data = this.data.filter((item: DashboardItem) => item.key !== dashboard.key);
    this.tableData$.next(this.data);
  }
}
