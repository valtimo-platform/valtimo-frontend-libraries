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
  PageTitleService,
  RenderInPageHeaderDirectiveModule,
} from '@valtimo/components';
import {ActivatedRoute} from '@angular/router';
import {BehaviorSubject, combineLatest, filter, map, Observable, switchMap, take, tap} from 'rxjs';
import {ProcessDefinition, ProcessService} from '@valtimo/process';
import {DropdownModule, ListItem, LoadingModule, SelectModule} from 'carbon-components-angular';
import Modeler from 'bpmn-js/lib/Modeler';
import BpmnViewer from 'bpmn-js';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

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
  ],
})
export class ProcessManagementEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('modeler', {static: false}) modelerElementRef!: ElementRef;
  @ViewChild('viewer', {static: false}) viewerElementRef!: ElementRef;

  public readonly loading$ = new BehaviorSubject<boolean>(true);

  private readonly _selectionProcessDefinition$ = new BehaviorSubject<ProcessDefinition | null>(
    null
  );

  private _bpmnModeler!: Modeler;
  private _bpmnViewer!: BpmnViewer;

  public isReadOnlyProcess$ = new BehaviorSubject<boolean>(false);
  public isSystemProcess$ = new BehaviorSubject<boolean>(false);

  public readonly selectedProcessDefinitionXml$ = this._selectionProcessDefinition$.pipe(
    filter(selectedProcessDefinition => !!selectedProcessDefinition?.id),
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

  public readonly processDefinitionVersions$ = this._processDefinitionKey$.pipe(
    switchMap(processDefinitionKey =>
      this.processService.getProcessDefinitionVersions(processDefinitionKey)
    ),
    tap(processDefinitions => this.setSelectedProcessDefinitionOnInit(processDefinitions))
  );

  public readonly processDefinitionVersionsListItems$: Observable<ListItem[]> = combineLatest([
    this.processDefinitionVersions$,
    this._selectionProcessDefinition$,
    this.translateService.stream('key'),
  ]).pipe(
    map(([processDefinitionVersions, selectionProcessDefinition]) =>
      processDefinitionVersions.map(processDefinitionVersion => ({
        id: processDefinitionVersion.version,
        content: `${this.translateService.instant('processManagementEditor.version')}${processDefinitionVersion.version}`,
        selected: selectionProcessDefinition.version === processDefinitionVersion.version,
      }))
    )
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly processService: ProcessService,
    private readonly pageTitleService: PageTitleService,
    private readonly translateService: TranslateService
  ) {}

  public ngAfterViewInit(): void {
    this.initModeler();
    this.initViewer();
  }

  public ngOnDestroy(): void {
    this._bpmnModeler?.destroy();
    this._bpmnViewer?.destroy();
  }

  private setSelectedProcessDefinitionOnInit(processDefinitions: ProcessDefinition[]): void {
    this._selectionProcessDefinition$.pipe(take(1)).subscribe(selectedProcessDefinition => {
      if (selectedProcessDefinition) return;

      this._selectionProcessDefinition$.next(
        processDefinitions.reduce((acc, version) => (version.version > acc.version ? version : acc))
      );
    });
  }

  private initModeler(): void {
    this._bpmnModeler = new Modeler();
    this._bpmnModeler?.attachTo(this.modelerElementRef.nativeElement);
  }

  private initViewer(): void {
    this._bpmnViewer = new BpmnViewer();
    this._bpmnViewer?.attachTo(this.viewerElementRef.nativeElement);
  }
}
