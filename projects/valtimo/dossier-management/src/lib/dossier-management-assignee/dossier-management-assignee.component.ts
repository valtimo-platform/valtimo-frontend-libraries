import {Component} from '@angular/core';
import {DocumentService} from '@valtimo/document';
import {filter, map, Observable, switchMap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'valtimo-dossier-management-assignee',
  templateUrl: './dossier-management-assignee.component.html',
  styleUrls: ['./dossier-management-assignee.component.css'],
})
export class DossierManagementAssigneeComponent {
  canHaveAssignee = false;

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.name || ''),
    filter(docDefName => !!docDefName)
  );

  readonly caseSettingsAssignee$ = this.documentDefinitionName$.pipe(
    switchMap(documentDefinitionName =>
      this.documentService.patchCaseSettings(documentDefinitionName, {
        canHaveAssignee: this.canHaveAssignee,
      })
    )
  );

  constructor(private readonly documentService: DocumentService, private route: ActivatedRoute) {}

  toggleAssignee(): void {
    this.canHaveAssignee = !this.canHaveAssignee;
  }
}
