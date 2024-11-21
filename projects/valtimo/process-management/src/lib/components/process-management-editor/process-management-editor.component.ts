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

import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  FitPageDirectiveModule,
  ModalService,
  PageHeaderService,
  PageTitleService,
  RenderInPageHeaderDirectiveModule,
} from '@valtimo/components';
import {ActivatedRoute} from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  from,
  map,
  Observable,
  startWith,
  Subject,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {ProcessDefinition, ProcessService} from '@valtimo/process';
import {
  ButtonModule,
  DropdownModule,
  IconModule,
  IconService,
  ListItem,
  LoadingModule,
  SelectModule,
  TagModule,
} from 'carbon-components-angular';
import Modeler from 'bpmn-js/lib/Modeler';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {Deploy16} from '@carbon/icons';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from 'bpmn-js-properties-panel';
import camundaPlatformBehaviors from 'camunda-bpmn-js-behaviors/lib/camunda-platform';
import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda.json';
import {valtimoPropertiesProviderModule} from './panel';
import {distinctUntilChanged} from 'rxjs/operators';
import {isEqual} from 'lodash';
import {ProcessManagementEditorService} from '../../services';
import {ProcessManagementWindow} from '../../models';
import {
  ProcessLinkButtonService,
  ProcessLinkModule,
  ProcessLinkService,
  ProcessLinkStateService,
  ProcessLinkStepService,
} from '@valtimo/process-link';

@Component({
  selector: 'valtimo-process-management-editor',
  templateUrl: './process-management-editor.component.html',
  styleUrls: ['./process-management-editor.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FitPageDirectiveModule,
    LoadingModule,
    RenderInPageHeaderDirectiveModule,
    DropdownModule,
    ReactiveFormsModule,
    SelectModule,
    ButtonModule,
    IconModule,
    TranslateModule,
    TagModule,
    ProcessLinkModule,
    ProcessLinkModule,
  ],
  providers: [
    ProcessManagementEditorService,
    ProcessLinkStateService,
    ProcessLinkStepService,
    ProcessLinkButtonService,
  ],
})
export class ProcessManagementEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('modeler', {static: false}) modelerElementRef!: ElementRef;
  @ViewChild('modelerPanel', {static: false}) modelerPanelElementRef!: ElementRef;
  @ViewChild('viewer', {static: false}) viewerElementRef!: ElementRef;

  public readonly loading$ = new BehaviorSubject<boolean>(true);

  private _bpmnModeler!: Modeler;
  private _bpmnViewer!: NavigatedViewer;

  public isReadOnlyProcess$ = new BehaviorSubject<boolean>(false);
  public isSystemProcess$ = new BehaviorSubject<boolean>(false);

  public readonly selectedProcessDefinitionXml$ =
    this.processManagementEditorService.selectionProcessDefinition$.pipe(
      filter(selectedProcessDefinition => !!selectedProcessDefinition?.id),
      distinctUntilChanged((previous, current) => isEqual(previous, current)),
      tap(selectedProcessDefinition => {
        this.loading$.next(true);
        this.pageTitleService.setCustomPageTitle(selectedProcessDefinition.name);
      }),
      switchMap(selectedProcessDefinition =>
        this.processService.getProcessDefinitionXml(selectedProcessDefinition.id)
      ),
      tap(result => {
        this._bpmnModeler?.importXML(result.bpmn20Xml);
        this._bpmnViewer?.importXML(result.bpmn20Xml);
        this.isReadOnlyProcess$.next(result.readOnly);
        this.isSystemProcess$.next(result.systemProcess);
        this.loading$.next(false);
      })
    );

  private readonly _processDefinitionKey$ = this.route.params.pipe(
    map(params => params.key),
    filter(key => !!key)
  );

  private readonly _reload$ = new Subject<null>();

  public readonly changesPending$ = new BehaviorSubject<boolean>(false);

  public readonly processDefinitionVersions$ = combineLatest([
    this._processDefinitionKey$,
    this._reload$.pipe(startWith(null)),
  ]).pipe(
    switchMap(([processDefinitionKey]) =>
      this.processService.getProcessDefinitionVersions(processDefinitionKey)
    ),
    tap(processDefinitions => {
      this.changesPending$.next(false);
      this.setSelectedProcessDefinitionToLatest(processDefinitions);
    })
  );

  public readonly processDefinitionVersionsListItems$: Observable<ListItem[]> = combineLatest([
    this.processDefinitionVersions$,
    this.processManagementEditorService.selectionProcessDefinition$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([processDefinitionVersions, selectionProcessDefinition]) =>
      processDefinitionVersions
        .map(processDefinitionVersion => ({
          id: processDefinitionVersion.version,
          content: `${this.translateService.instant('processManagement.version')}${processDefinitionVersion.version}`,
          selected: selectionProcessDefinition.version === processDefinitionVersion.version,
          processDefinitionVersion,
        }))
        .sort((a, b) => b.id - a.id)
    )
  );

  public readonly compactMode$ = this.pageHeaderService.compactMode$;

  private readonly _subscriptions = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly processService: ProcessService,
    private readonly pageTitleService: PageTitleService,
    private readonly translateService: TranslateService,
    private readonly iconService: IconService,
    private readonly pageHeaderService: PageHeaderService,
    private readonly processManagementEditorService: ProcessManagementEditorService,
    private readonly modalService: ModalService,
    private readonly processLinkService: ProcessLinkService,
    private readonly processLinkStateService: ProcessLinkStateService
  ) {
    this.iconService.registerAll([Deploy16]);
    (window as any as ProcessManagementWindow).processManagementEditorService =
      processManagementEditorService;
    (window as any as ProcessManagementWindow).translateService = translateService;
  }

  public ngAfterViewInit(): void {
    this.initModeler();
    this.initViewer();
    this.subscribeToOpenProcessLinkModalEvents();
  }

  public ngOnDestroy(): void {
    this._bpmnModeler?.destroy();
    this._bpmnViewer?.destroy();
    this._subscriptions.unsubscribe();
  }

  public deployChanges(): void {
    from(this._bpmnModeler.saveXML())
      .pipe(
        take(1),
        switchMap(result => this.processService.deployProcess(result.xml))
      )
      .subscribe(() => {
        this.reload();
      });
  }

  public selectedVersionChange(event: {item: {processDefinitionVersion: ProcessDefinition}}): void {
    this.processManagementEditorService.selectionProcessDefinition$
      .pipe(take(1))
      .subscribe(selectedVersion => {
        if (selectedVersion.id !== event.item.processDefinitionVersion.id) {
          this.processManagementEditorService.setSelectedProcessDefinition(
            event?.item?.processDefinitionVersion
          );
          this.changesPending$.next(false);
        }
      });
  }

  private setSelectedProcessDefinitionToLatest(processDefinitions: ProcessDefinition[]): void {
    this.processManagementEditorService.setSelectedProcessDefinition(
      processDefinitions.reduce((acc, version) => (version.version > acc.version ? version : acc))
    );
  }

  private initModeler(): void {
    this._bpmnModeler = new Modeler({
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule,
        camundaPlatformBehaviors,
        valtimoPropertiesProviderModule,
      ],
      moddleExtensions: {
        camunda: CamundaBpmnModdle,
      },
      propertiesPanel: {
        parent: this.modelerPanelElementRef.nativeElement,
      },
    });
    this._bpmnModeler?.attachTo(this.modelerElementRef.nativeElement);
    this.listenToModelerEvents();
  }

  private listenToModelerEvents(): void {
    this._bpmnModeler.on('commandStack.changed', () => {
      this.changesPending$.next(true);
    });
  }

  private initViewer(): void {
    this._bpmnViewer = new NavigatedViewer();
    this._bpmnViewer?.attachTo(this.viewerElementRef.nativeElement);
  }

  private reload(): void {
    this._reload$.next(null);
  }

  private subscribeToOpenProcessLinkModalEvents(): void {
    this._subscriptions.add(
      this.processManagementEditorService.openProcessLinkModalEvents$.subscribe(event => {
        console.log('open event', event);
      })
    );
  }
}
