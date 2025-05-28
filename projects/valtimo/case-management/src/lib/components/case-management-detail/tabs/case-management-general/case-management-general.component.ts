/*
 * Copyright 2015-2025 Ritense BV, the Netherlands.
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

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  Optional,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {combineLatest, map, Observable, switchMap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DocumentDefinition, DocumentService} from '@valtimo/document';
import {
  CASE_CONFIGURATION_EXTENSIONS_TOKEN,
  DraftVersionService,
  EnvironmentService,
} from '@valtimo/shared';
import {CaseManagementService} from '../../../../services';
import {MuuriItemComponent} from '@valtimo/components';

@Component({
  standalone: false,
  selector: 'valtimo-case-management-general',
  templateUrl: './case-management-general.component.html',
  styleUrl: './case-management-general.component.scss',
})
export class CaseManagementGeneralComponent implements AfterViewInit {
  @ViewChild('extensions', {read: ViewContainerRef})
  private _extensions: ViewContainerRef;

  public readonly params$: Observable<any> | undefined = this.route.parent?.params.pipe(
    map(({caseDefinitionKey, caseDefinitionVersionTag}) => ({
      caseDefinitionKey: caseDefinitionKey,
      caseDefinitionVersionTag: caseDefinitionVersionTag,
    }))
  );

  public readonly documentDefinition$: Observable<DocumentDefinition> = this.params$.pipe(
    switchMap(({caseDefinitionKey}) =>
      this.documentService.getDocumentDefinitionForManagement(caseDefinitionKey)
    )
  );

  public readonly canUpdateGlobalConfiguration$ =
    this.environmentService.canUpdateGlobalConfiguration();

  public readonly isDraftVersion$: Observable<boolean> = this.params$.pipe(
    switchMap(params =>
      this.draftVersionService.isDraftVersion(
        params.caseDefinitionKey,
        params.caseDefinitionVersionTag
      )
    )
  );

  public readonly isReadOnly$: Observable<boolean> = combineLatest([
    this.canUpdateGlobalConfiguration$,
    this.isDraftVersion$,
  ]).pipe(
    map(
      ([canUpdateGlobalConfiguration, isDraftVersion]) =>
        !canUpdateGlobalConfiguration || !isDraftVersion
    )
  );

  constructor(
    private readonly documentService: DocumentService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly caseManagementService: CaseManagementService,
    @Optional()
    @Inject(CASE_CONFIGURATION_EXTENSIONS_TOKEN)
    private readonly caseConfigurationExtensionComponents: Type<any>[],
    private readonly draftVersionService: DraftVersionService,
    private readonly environmentService: EnvironmentService
  ) {}

  public ngAfterViewInit(): void {
    this.renderExtensions();
  }

  private renderExtensions(): void {
    if (
      !Array.isArray(this.caseConfigurationExtensionComponents) ||
      this.caseConfigurationExtensionComponents.length === 0
    ) {
      return;
    }

    this.caseConfigurationExtensionComponents.forEach(extensionComponent => {
      const itemRef = this._extensions.createComponent(MuuriItemComponent);

      const wrapperInstance = itemRef.instance;
      const container = wrapperInstance.container;

      const componentRef = container.createComponent(extensionComponent);
      componentRef.setInput('isReadOnly$', this.isReadOnly$);
    });

    this.cdr.detectChanges();
  }
}
