import {Component} from '@angular/core';
import {BehaviorSubject, map, Observable, switchMap} from 'rxjs';
import {CaseSettings, DocumentService} from '@valtimo/document';
import {ActivatedRoute} from '@angular/router';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'valtimo-case-management-case-handler',
  templateUrl: './case-management-case-handler.component.html',
  styleUrl: './case-management-case-handler.component.scss',
})
export class CaseManagementCaseHandlerComponent {
  readonly disabled$ = new BehaviorSubject<boolean>(false);

  private readonly _refresh$ = new BehaviorSubject<null>(null);

  readonly loading$ = new BehaviorSubject<boolean>(true);

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.name || '')
  );

  readonly currentValue$: Observable<CaseSettings> = this._refresh$.pipe(
    switchMap(() => this.documentDefinitionName$),
    switchMap(documentDefinitionName =>
      this.documentService.getCaseSettingsForManagement(documentDefinitionName)
    ),
    tap(() => this.loading$.next(false))
  );

  constructor(
    private readonly documentService: DocumentService,
    private route: ActivatedRoute
  ) {
    this.disabled$ = new BehaviorSubject<boolean>(false);
  }

  public updateCaseSettings(caseSettings: CaseSettings, documentDefinitionName: string): void {
    this.disableInput();

    this.documentService
      .patchCaseSettingsForManagement(documentDefinitionName, caseSettings)
      .subscribe(
        () => {
          this.enableInput();
          this.refreshSettings();
        },
        () => {
          this.enableInput();
        }
      );
  }

  public disableInput(): void {
    this.disabled$.next(true);
  }

  public enableInput(): void {
    this.disabled$.next(false);
  }

  public toggleAssignee(currentSettings: CaseSettings, documentDefinitionName: string) {
    this.updateCaseSettings(
      {
        canHaveAssignee: !currentSettings?.canHaveAssignee,
        autoAssignTasks: currentSettings.autoAssignTasks,
      },
      documentDefinitionName
    );
  }

  public toggleTaskAssignment(currentSettings: CaseSettings, documentDefinitionName: string) {
    this.updateCaseSettings(
      {
        canHaveAssignee: currentSettings?.canHaveAssignee,
        autoAssignTasks: !currentSettings.autoAssignTasks,
      },
      documentDefinitionName
    );
  }

  private refreshSettings(): void {
    this._refresh$.next(null);
  }
}
