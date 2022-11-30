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
  readonly disabled$!: Observable<boolean>;

  private readonly _refresh$ = new BehaviorSubject<null>(null);
  private readonly _inputDisabled$ = new BehaviorSubject<boolean>(false);

  readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.name || '')
  );

  readonly currentValue$: Observable<CaseSettings> = this._refresh$.pipe(
    switchMap(() => this.documentDefinitionName$),
    switchMap(documentDefinitionName =>
      this.documentService.getCaseSettings(documentDefinitionName)
    ),
    map(currentValue => currentValue),
    tap(() => this.loading$.next(false))
  );

  constructor(private readonly documentService: DocumentService, private route: ActivatedRoute) {
    this.disabled$ = this.inputDisabled$;
  }

  toggleAssignee(currentValue: boolean, documentDefinitionName: string): void {
    this.disableInput();

    this.documentService
      .patchCaseSettings(documentDefinitionName, {
        canHaveAssignee: currentValue,
      })
      .subscribe(() => {
        this.enableInput();
        this.refreshAssignee();
      });
  }

  disableInput(): void {
    this._inputDisabled$.next(true);
  }

  enableInput(): void {
    this._inputDisabled$.next(false);
  }

  refreshAssignee(): void {
    this._refresh$.next(null);
  }

  get refresh$(): Observable<any> {
    return this._refresh$.asObservable();
  }

  get inputDisabled$(): Observable<boolean> {
    return this._inputDisabled$.asObservable();
  }
}
