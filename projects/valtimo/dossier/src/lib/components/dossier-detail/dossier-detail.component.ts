/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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

import {Location} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {ActivatedRoute, ParamMap, Params, Router} from '@angular/router';
import {PermissionService} from '@valtimo/access-control';
import {BreadcrumbService, PageHeaderService, PageTitleService} from '@valtimo/components';
import {ConfigService} from '@valtimo/config';
import {
  CaseStatusService,
  Document,
  DocumentService,
  InternalCaseStatus,
  InternalCaseStatusUtils,
  ProcessDocumentDefinition,
} from '@valtimo/document';
import {KeycloakService} from 'keycloak-angular';
import moment from 'moment';
import {NGXLogger} from 'ngx-logger';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {DossierSupportingProcessStartModalComponent} from '../dossier-supporting-process-start-modal/dossier-supporting-process-start-modal.component';
import {TabLoaderImpl} from '../../models';
import {
  CAN_ASSIGN_CASE_PERMISSION,
  CAN_CLAIM_CASE_PERMISSION,
  DOSSIER_DETAIL_PERMISSION_RESOURCE,
} from '../../permissions';
import {DossierService, DossierTabService} from '../../services';
import {IconService} from 'carbon-components-angular';
import {ChevronDown16} from '@carbon/icons';

@Component({
  selector: 'valtimo-dossier-detail',
  templateUrl: './dossier-detail.component.html',
  styleUrls: ['./dossier-detail.component.scss'],
  providers: [DossierTabService],
})
export class DossierDetailComponent implements AfterViewInit, OnDestroy {
  @ViewChild('supportingProcessStartModal')
  supportingProcessStart: DossierSupportingProcessStartModalComponent;

  @ViewChild('tabContainer', {read: ViewContainerRef})
  viewContainerRef: ViewContainerRef;

  public customDossierHeaderItems: Array<any> = [];
  public document: Document | null = null;
  public documentDefinitionName: string;
  public documentDefinitionNameTitle: string;
  public documentId: string;
  public processDefinitionListFields: Array<any> = [];
  public processDocumentDefinitions: ProcessDocumentDefinition[] = [];
  public tabLoader: TabLoaderImpl | null = null;

  public readonly assigneeId$ = new BehaviorSubject<string>('');

  private readonly _caseStatusKey$ = new BehaviorSubject<string | null | 'NOT_AVAILABLE'>(null);

  public readonly caseStatusKey$: Observable<string | 'NOT_AVAILABLE'> = this._caseStatusKey$.pipe(
    filter(key => !!key)
  );

  public readonly document$: Observable<Document | null> =
    this.dossierService.refreshDocument$.pipe(
      switchMap(() => this.route.params),
      map((params: Params) => params?.documentId),
      switchMap((documentId: string) =>
        documentId ? this.documentService.getDocument(this.documentId) : of(null)
      ),
      tap((document: Document | null) => {
        if (document) {
          this.assigneeId$.next(document.assigneeId);
          this.document = document;
          this._caseStatusKey$.next(document?.internalStatus || 'NOT_AVAILABLE');

          if (
            this.configService.config.customDossierHeader?.hasOwnProperty(
              this.documentDefinitionName.toLowerCase()
            ) &&
            this.customDossierHeaderItems.length === 0
          ) {
            this.configService.config.customDossierHeader[
              this.documentDefinitionName.toLowerCase()
            ]?.forEach(item => this.getCustomDossierHeaderItem(item));
          }
        }
      })
    );

  public readonly documentDefinitionName$: Observable<string> = this.route.params.pipe(
    map(params => params.documentDefinitionName || '')
  );

  public readonly caseStatus$: Observable<InternalCaseStatus | undefined> =
    this.documentDefinitionName$.pipe(
      filter(documentDefinitionName => !!documentDefinitionName),
      switchMap(documentDefinitionName =>
        combineLatest([
          this.caseStatusService.getInternalCaseStatuses(documentDefinitionName),
          this.caseStatusKey$,
        ])
      ),
      map(
        ([statuses, key]) => key !== 'NOT_AVAILABLE' && statuses.find(status => status?.key === key)
      ),
      map(
        status =>
          status && {
            ...status,
            tagType: InternalCaseStatusUtils.getTagTypeFromInternalCaseStatusColor(status.color),
          }
      )
    );

  public readonly userId$: Observable<string | undefined> = of(
    this.keyCloakService.isLoggedIn()
  ).pipe(
    switchMap(() => this.keyCloakService.loadUserProfile()),
    map(profile => profile?.id)
  );

  public readonly isAssigning$ = new BehaviorSubject<boolean>(false);
  public readonly isAssignedToCurrentUser$: Observable<boolean> = combineLatest([
    this.assigneeId$,
    this.userId$,
  ]).pipe(
    map(([assigneeId, userId]) => !!assigneeId && !!userId && assigneeId === userId),
    startWith(true)
  );

  public readonly canHaveAssignee$: Observable<boolean> = this.documentDefinitionName$.pipe(
    switchMap(documentDefinitionName =>
      this.documentService.getCaseSettings(documentDefinitionName)
    ),
    map(caseSettings => caseSettings?.canHaveAssignee)
  );

  public readonly canAssignLoaded$ = new BehaviorSubject<boolean>(false);
  public readonly canAssign$: Observable<boolean> = this.route.paramMap.pipe(
    switchMap((params: ParamMap) =>
      this.permissionService.requestPermission(CAN_ASSIGN_CASE_PERMISSION, {
        resource: DOSSIER_DETAIL_PERMISSION_RESOURCE.jsonSchemaDocument,
        identifier: params.get('documentId') ?? '',
      })
    ),
    tap(() => {
      this.canAssignLoaded$.next(true);
    })
  );

  public readonly canClaim$: Observable<boolean> = this.route.paramMap.pipe(
    switchMap((params: ParamMap) =>
      this.permissionService.requestPermission(CAN_CLAIM_CASE_PERMISSION, {
        resource: DOSSIER_DETAIL_PERMISSION_RESOURCE.jsonSchemaDocument,
        identifier: params.get('documentId') ?? '',
      })
    )
  );

  public readonly loadingTabs$ = new BehaviorSubject<boolean>(true);
  public readonly noTabsConfigured$ = new BehaviorSubject<boolean>(false);

  public readonly compactMode$ = this.pageHeaderService.compactMode$;

  private _snapshot: ParamMap;
  private _initialTabName: string;

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly configService: ConfigService,
    private readonly documentService: DocumentService,
    private readonly keyCloakService: KeycloakService,
    private readonly location: Location,
    private readonly logger: NGXLogger,
    private readonly permissionService: PermissionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dossierTabService: DossierTabService,
    private readonly dossierService: DossierService,
    private readonly caseStatusService: CaseStatusService,
    private readonly pageTitleService: PageTitleService,
    private readonly iconService: IconService,
    private readonly pageHeaderService: PageHeaderService
  ) {
    this._snapshot = this.route.snapshot.paramMap;
    this.documentDefinitionName = this._snapshot.get('documentDefinitionName') || '';
    this.documentId = this._snapshot.get('documentId') || '';
  }

  public ngAfterViewInit(): void {
    this.initTabLoader();
    this.initBreadcrumb();
    this.getAllAssociatedProcessDefinitions();
    this.pageTitleService.disableReset();
    this.iconService.registerAll([ChevronDown16]);
  }

  public ngOnDestroy(): void {
    this.breadcrumbService.clearSecondBreadcrumb();
    this.pageTitleService.enableReset();
  }

  public getAllAssociatedProcessDefinitions(): void {
    this.documentService
      .findProcessDocumentDefinitionsByStartableByUser(this.documentDefinitionName, true)
      .subscribe((processDocumentDefinitions: ProcessDocumentDefinition[]) => {
        this.processDocumentDefinitions = processDocumentDefinitions;

        this.processDefinitionListFields = [
          {
            key: 'processName',
            label: 'Proces',
          },
        ];
      });
  }

  public startProcess(processDocumentDefinition: ProcessDocumentDefinition): void {
    this.supportingProcessStart.openModal(processDocumentDefinition, this.documentId);
  }

  public claimAssignee(): void {
    this.isAssigning$.next(true);

    this.userId$
      .pipe(
        take(1),
        switchMap((userId: string | undefined) =>
          this.documentService.assignHandlerToDocument(this.documentId, userId ?? '')
        )
      )
      .subscribe({
        next: (): void => {
          this.isAssigning$.next(false);
          this.dossierService.refresh();
        },
        error: (): void => {
          this.isAssigning$.next(false);
          this.logger.debug('Something went wrong while assigning user to case');
        },
      });
  }

  public unassignAssignee(): void {
    this.isAssigning$.next(true);

    this.userId$
      .pipe(
        take(1),
        switchMap((userId: string | undefined) =>
          this.documentService.unassignHandlerFromDocument(this.documentId)
        )
      )
      .subscribe({
        next: (): void => {
          this.isAssigning$.next(false);
          this.dossierService.refresh();
        },
        error: (): void => {
          this.isAssigning$.next(false);
          this.logger.debug('Something went wrong while unassigning user from case');
        },
      });
  }

  private initBreadcrumb(): void {
    this.documentService
      .getDocumentDefinition(this.documentDefinitionName)
      .subscribe(definition => {
        this.documentDefinitionNameTitle = definition.schema.title;
        this.setBreadcrumb();
      });
  }

  private initTabLoader(): void {
    this.dossierTabService.tabs$.pipe(take(1)).subscribe(tabs => {
      if (tabs?.length > 0) {
        this._initialTabName = this._snapshot.get('tab') ?? '';
        this.tabLoader = new TabLoaderImpl(
          tabs,
          this.componentFactoryResolver,
          this.viewContainerRef,
          this.router,
          this.route
        );
        this.tabLoader.initial(this._initialTabName);
        this.dossierTabService.setTabLoader(this.tabLoader);
        this.loadingTabs$.next(false);
      } else {
        this.noTabsConfigured$.next(true);
        this.loadingTabs$.next(false);
      }
    });
  }

  public assignmentOfDocumentChanged(): void {
    this.dossierService.refresh();
  }

  private getCustomDossierHeaderItem(item): void {
    this.customDossierHeaderItems.push({
      label: item['labelTranslationKey'] || '',
      columnSize: item['columnSize'] || 3,
      textSize: item['textSize'] || 'md',
      customClass: item['customClass'] || '',
      modifier: item['modifier'] || '',
      value: item['propertyPaths']?.reduce(
        (prev, curr) => prev + this.getStringFromDocumentPath(item, curr),
        ''
      ),
    });
  }

  private getStringFromDocumentPath(item, path): string {
    const prefix = item['propertyPaths'].indexOf(path) > 0 ? ' ' : '';
    let string = this.getNestedProperty(this.document.content, path, item['noValueText']) || '';
    const dateFormats = [moment.ISO_8601, 'MM-DD-YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'];
    switch (item['modifier']) {
      case 'age': {
        if (moment(string, dateFormats, true).isValid()) {
          string = moment().diff(string, 'years');
        }
        break;
      }
      default: {
        if (moment(string, dateFormats, true).isValid()) {
          string = moment(string).format('DD-MM-YYYY');
        }
      }
    }
    return prefix + string;
  }

  private getNestedProperty(obj: any, path: string, defaultValue: any): any {
    return (
      path.split('.').reduce((currentObject, key) => currentObject?.[key], obj) || defaultValue
    );
  }

  private setBreadcrumb(): void {
    this.breadcrumbService.setSecondBreadcrumb({
      route: [`/dossiers/${this.documentDefinitionName}`],
      content: this.documentDefinitionNameTitle,
      href: `/dossiers/${this.documentDefinitionName}`,
    });
  }
}
