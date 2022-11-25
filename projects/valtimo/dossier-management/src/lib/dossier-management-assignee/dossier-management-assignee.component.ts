import {Component} from '@angular/core';
import {DocumentService, CaseSettings} from '@valtimo/document';
import {BehaviorSubject, map, Observable, switchMap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'valtimo-dossier-management-assignee',
  templateUrl: './dossier-management-assignee.component.html',
  styleUrls: ['./dossier-management-assignee.component.css'],
})
export class DossierManagementAssigneeComponent {
  readonly loading$ = new BehaviorSubject<boolean>(true);

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.name || '')
  );

  readonly currentValue$: Observable<CaseSettings> = this.documentDefinitionName$.pipe(
    switchMap(documentDefinitionName =>
      this.documentService.getCaseSettings(documentDefinitionName)
    ),
    map(currentValue => currentValue),
    tap(() => this.loading$.next(false))
  );

  constructor(private readonly documentService: DocumentService, private route: ActivatedRoute) {}

  toggleAssignee(currentValue: boolean, documentDefinitionName: string): void {
    this.documentService
      .patchCaseSettings(documentDefinitionName, {
        canHaveAssignee: !currentValue,
      })
      .subscribe();
  }
}
