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
import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {CARBON_CONSTANTS, CarbonListComponent, ColumnConfig, ViewType} from '@valtimo/components';
import {BehaviorSubject, delay, finalize, Observable, Subject, tap} from 'rxjs';
import {DownloadFormFlowOutput, FormFlow} from '../../models';
import {FormFlowExportService} from '../../services/form-flow-export.service';
import {FormFlowService} from '../../services/form-flow.service';

@Component({
  templateUrl: './form-flow-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFlowOverviewComponent implements OnInit {
  @ViewChild(CarbonListComponent) carbonList: CarbonListComponent;

  public fields: ColumnConfig[] = [
    {
      viewType: ViewType.TEXT,
      key: 'key',
      label: 'formFlow.formFlows.key',
    },
  ];

  public readonly formFlows$: Observable<FormFlow[]> = this.formFlowService.formFlows$;
  public readonly loading$: Observable<boolean> = this.formFlowService.loading$;
  public readonly skeleton$ = new BehaviorSubject<boolean>(false);
  public readonly showAddModal$ = new BehaviorSubject<boolean>(false);
  public readonly showDeleteModal$ = new BehaviorSubject<boolean>(false);
  public readonly showExportModal$ = new BehaviorSubject<boolean>(false);
  public readonly selectedRowKeys$ = new BehaviorSubject<Array<string>>([]);
  public readonly resetExportType$ = new Subject<null>();
  public readonly exportDisabled$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly formFlowService: FormFlowService,
    private readonly formFlowExportService: FormFlowExportService,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.formFlowService.loadFormFlows();
  }

  public openAddModal(): void {
    this.showAddModal$.next(true);
  }

  public onAdd(data: FormFlow | null): void {
    this.showAddModal$.next(false);

    if (!data) {
      return;
    }

    this.formFlowService.dispatchAction(
      this.formFlowService.addFormFlow(data).pipe(
        finalize(() => {
          this.showAddModal$.next(false);
        })
      )
    );
  }

  public showDeleteModal(): void {
    this.setSelectedFormFlowKeys();
    this.showDeleteModal$.next(true);
  }

  public showExportModal(): void {
    this.setSelectedFormFlowKeys();
    this.showExportModal$.next(true);
  }

  public closeExportModal(): void {
    this.showExportModal$.next(false);
  }

  public onDelete(formFlows: Array<string>): void {
    this.enableSkeleton();

    this.formFlowService.dispatchAction(
      this.formFlowService.deleteFormFlows({formFlows}).pipe(
        finalize(() => {
          this.disableSkeleton();
        })
      )
    );
  }

  public onExport(event: DownloadFormFlowOutput): void {
    this.exportDisabled$.next(true);

    this.formFlowExportService
      .downloadFormFlows(event)
      .pipe(
        tap(() => {
          this.resetExportType$.next(null);
        }),
        delay(CARBON_CONSTANTS.modalAnimationMs),
        tap(() => {
          this.exportDisabled$.next(false);
        })
      )
      .subscribe();
  }

  public onRowClick(formFlow: FormFlow): void {
    this.router.navigate([`/form-flow/${formFlow.key}`]);
  }

  private enableSkeleton(): void {
    this.skeleton$.next(true);
  }

  private disableSkeleton(): void {
    this.skeleton$.next(false);
  }

  private setSelectedFormFlowKeys(): void {
    this.selectedRowKeys$.next(this.carbonList.selectedItems.map((formFlow: FormFlow) => formFlow.key));
  }
}
