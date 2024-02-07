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
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Edit16, Save16} from '@carbon/icons';
import {EditorModel} from '@valtimo/components';
import {
  DefinitionId,
  DocumentDefinition,
  DocumentDefinitionCreateRequest,
  DocumentService,
} from '@valtimo/document';
import {IconService} from 'carbon-components-angular';
import {BehaviorSubject, combineLatest, Observable, of} from 'rxjs';
import {map, switchMap, take, tap} from 'rxjs/operators';

import {DossierDetailService} from '../../services';

@Component({
  selector: 'valtimo-dossier-management-document-definition',
  templateUrl: './dossier-management-document-definition.component.html',
  styleUrls: ['./dossier-management-document-definition.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DossierManagementDocumentDefinitionComponent {
  public readonly loadingDocumentDefinition$ = this.dossierDetailService.loadingDocumentDefinition$;
  private readonly _refreshEditor$ = new BehaviorSubject<null>(null);
  public readonly documentDefinitionModel$: Observable<EditorModel> = this._refreshEditor$.pipe(
    switchMap(() => this.dossierDetailService.documentDefinitionModel$)
  );

  public readonly pendingChanges$ = new BehaviorSubject<boolean>(false);
  public readonly editActive$ = new BehaviorSubject<boolean>(false);
  public readonly showSaveConfirmation$ = new BehaviorSubject<boolean>(false);
  public readonly showCancelConfirmation$ = new BehaviorSubject<boolean>(false);
  public readonly selectedDocumentDefinition$ = this.dossierDetailService.documentDefinition$.pipe(
    tap((documentDefinition: DocumentDefinition) => (this._initialId = documentDefinition.id))
  );
  private readonly _changeIsValid$ = new BehaviorSubject<boolean>(false);
  private readonly _idChanged$ = new BehaviorSubject<boolean>(false);

  public readonly saveButtonDisabled$ = combineLatest([
    this.pendingChanges$,
    this._changeIsValid$,
    this._idChanged$,
  ]).pipe(
    map(
      ([pendingChanges, changeIsValid, idChanged]) => !pendingChanges || !changeIsValid || idChanged
    )
  );

  private _changesToSave: DocumentDefinition;
  private _initialId: DefinitionId;

  constructor(
    private readonly documentService: DocumentService,
    private readonly dossierDetailService: DossierDetailService,
    private readonly iconService: IconService
  ) {
    this.iconService.registerAll([Edit16, Save16]);
  }

  public downloadDefinition(): void {
    this.selectedDocumentDefinition$.pipe(take(1)).subscribe(definition => {
      const dataString =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(definition.schema, null, 2));
      const downloadAnchorElement = document.getElementById('downloadAnchorElement');
      if (!downloadAnchorElement) {
        return;
      }

      downloadAnchorElement.setAttribute('href', dataString);
      downloadAnchorElement.setAttribute(
        'download',
        `${definition.id.name}-v${definition.id.version}.json`
      );
      downloadAnchorElement.click();
    });
  }

  public onCancelClick(pendingChanges: boolean): void {
    if (pendingChanges) {
      this.showCancelConfirmation$.next(true);
      return;
    }

    this.editActive$.next(false);
    this._refreshEditor$.next(null);
  }

  public onSaveEvent(): void {
    this.showSaveConfirmation$.next(false);
    this.editActive$.next(false);
    const newDocumentDefinition = new DocumentDefinitionCreateRequest(
      JSON.stringify(this._changesToSave)
    );

    console.log(JSON.stringify(this._changesToSave));
    console.log(newDocumentDefinition);

    this.documentService
      .createDocumentDefinitionForManagement(newDocumentDefinition)
      .pipe(take(1))
      .subscribe(res => {
        console.log(res);
      });
  }

  public onSaveCancelEvent(): void {
    this.showSaveConfirmation$.next(false);
  }

  public onEditClick(): void {
    this.editActive$.next(true);
  }

  public onSaveClick(): void {
    this.showSaveConfirmation$.next(true);
  }

  public onValueChangeEvent(value: string): void {
    this.pendingChanges$.next(true);
    this._changesToSave = JSON.parse(value);
    const {name, version} = this._changesToSave.id;
    this._idChanged$.next(this._initialId.name !== name || this._initialId.version !== version);
  }

  public onValidEvent(valid: boolean): void {
    this._changeIsValid$.next(valid);
  }
}
