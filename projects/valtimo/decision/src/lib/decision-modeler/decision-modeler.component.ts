/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
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

import {DecisionService} from '../decision.service';
import {AfterViewInit, Component} from '@angular/core';
import DmnJS from 'dmn-js/dist/dmn-modeler.development.js';
import {ActivatedRoute, Router} from '@angular/router';
import {Decision, DecisionXml} from '../models';
import {migrateDiagram} from '@bpmn-io/dmn-migrate';
import {LayoutService} from '@valtimo/layout';
import {BehaviorSubject, combineLatest, from, map, Observable, switchMap, take, tap} from 'rxjs';
import {SelectedValue, SelectItem} from '@valtimo/user-interface';
import {AlertService} from '@valtimo/components';

declare var $: any;

@Component({
  selector: 'valtimo-decision-modeler',
  templateUrl: './decision-modeler.component.html',
  styleUrls: ['./decision-modeler.component.scss'],
})
export class DecisionModelerComponent implements AfterViewInit {
  decisionTitle!: string;
  private CLASS_NAMES = {
    drd: 'dmn-icon-lasso-tool',
    decisionTable: 'dmn-icon-decision-table',
    literalExpression: 'dmn-icon-literal-expression',
  };
  private $container!: any;
  private $tabs!: any;
  private dmnModeler!: DmnJS;

  readonly versionSelectionDisabled$ = new BehaviorSubject<boolean>(true);

  private readonly decisionId$: Observable<string | null> = this.route.params.pipe(
    map(params => params?.id),
    tap(() => this.versionSelectionDisabled$.next(true))
  );

  readonly selectionId$ = new BehaviorSubject<string>('');

  private readonly decision$: Observable<Decision> = this.decisionId$.pipe(
    switchMap(decisionId => this.decisionService.getDecisionById(decisionId)),
    tap(decision => {
      if (decision) {
        this.selectionId$.next(decision.id);
      }
    })
  );

  readonly decisionTitle$: Observable<string> = this.decision$.pipe(
    map(decision => decision?.key || '')
  );

  readonly createdDecisionVersionSelectItems$ = new BehaviorSubject<Array<SelectItem>>([]);

  readonly decisionVersionSelectItems$: Observable<Array<SelectItem>> = combineLatest([
    this.decision$,
    this.decisionService.getDecisions(),
    this.createdDecisionVersionSelectItems$,
  ]).pipe(
    map(([currentDecision, decisions, createdDecisionVersionSelectItems]) => {
      const decisionsWithKey = decisions.filter(decision => decision.key === currentDecision.key);

      return [
        ...decisionsWithKey.map(decision => ({
          id: decision.id,
          text: decision.version.toString(),
        })),
        ...createdDecisionVersionSelectItems,
      ].sort((a, b) => Number(b.text) - Number(a.text));
    }),
    tap(() => this.versionSelectionDisabled$.next(false))
  );

  readonly decisionXml$ = this.decisionId$.pipe(
    switchMap(decisionId => this.decisionService.getDecisionXml(decisionId)),
    tap(decisionXml => {
      if (decisionXml) {
        this.loadDecisionXml(decisionXml);
      }
    })
  );

  constructor(
    private readonly decisionService: DecisionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly alertService: AlertService,
    public layoutService: LayoutService
  ) {}

  ngAfterViewInit(): void {
    this.setProperties();
    this.setTabEvents();
    this.setModelerEvents();
  }

  switchVersion(decisionId: string | SelectedValue): void {
    if (decisionId) {
      this.router.navigate(['/decision-tables', decisionId]);
    }
  }

  exportDiagram(): void {
    from(this.dmnModeler.saveXML({format: true}))
      .pipe(
        map(result => (result as any).xml),
        map(
          xml =>
            new File([xml], 'diagram.dmn', {
              type: 'text/plain',
            })
        ),
        switchMap(file => this.decisionService.deployDmn(file)),
        tap(res => {
          const deployedDefinitions = res.deployedDecisionDefinitions;
          const deployedDecisionDefinition =
            deployedDefinitions[Object.keys(deployedDefinitions)[0]];
          const deployedId = deployedDecisionDefinition.id;

          this.createdDecisionVersionSelectItems$
            .pipe(take(1))
            .subscribe(createdDecisionVersionSelectItems => {
              if (deployedDecisionDefinition) {
                this.createdDecisionVersionSelectItems$.next([
                  ...createdDecisionVersionSelectItems,
                  {
                    id: deployedId,
                    text: deployedDecisionDefinition.version.toString(),
                  },
                ]);
              }

              if (deployedId) {
                setTimeout(() => {
                  this.switchVersion(deployedId);
                });
              }
            });
        })
      )
      .subscribe();
  }

  async openDiagram(dmnXML) {
    // import diagram
    try {
      const {warnings} = await this.dmnModeler.importXML(dmnXML);

      if (warnings.length) {
        console.log('import with warnings', warnings);
      } else {
        console.log('import successful');
      }

      // access active editor components
      const activeEditor = this.dmnModeler.getActiveViewer();

      const canvas = activeEditor.get('canvas');

      // zoom to fit full viewport
      canvas.zoom('fit-viewport');
    } catch (err) {
      console.error('could not import DMN 1.3 diagram', err);
    }
  }

  private setProperties(): void {
    this.$container = $('.editor-container');
    this.$tabs = $('.editor-tabs');
    this.dmnModeler = new DmnJS({
      container: this.$container,
      height: 500,
      width: '100%',
      keyboard: {
        bindTo: window,
      },
    });
  }

  private setTabEvents = () => {
    const $tabs = this.$tabs;
    const dmnModeler = this.dmnModeler;

    $tabs.delegate('.tab', 'click', async function (e) {
      // get index of view from clicked tab
      const viewIdx = parseInt(this.getAttribute('data-id'), 10);

      // get view using index
      const view = dmnModeler.getViews()[viewIdx];

      // open view
      try {
        await dmnModeler.open(view);
      } catch (err) {
        console.error('error opening tab', err);
      }
    });
  };

  private setModelerEvents = () => {
    const $tabs = this.$tabs;
    const CLASS_NAMES = this.CLASS_NAMES;

    this.dmnModeler.on('views.changed', function (event) {
      // get views from event
      const {views, activeView} = event;

      // clear tabs
      $tabs.empty();

      // create a new tab for each view
      views.forEach(function (v, idx) {
        const className = CLASS_NAMES[v.type];

        const tab = $(`
            <div class="tab ${v === activeView ? 'active' : ''}" data-id="${idx}">
              <span class="${className}"></span>
              ${v.element.name || v.element.id}
            </div>
          `);

        $tabs.append(tab);
      });
    });
  };

  private loadDecisionXml(decision: DecisionXml): void {
    this.dmnModeler.importXML(decision.dmnXml, error => {
      if (error) {
        this.migrateAndLoadDecisionXml(decision);
      } else {
        this.setEditor();
      }
    });
  }

  private async migrateAndLoadDecisionXml(decision: DecisionXml) {
    const decisionXml = await migrateDiagram(decision.dmnXml);

    if (decisionXml) {
      this.dmnModeler.importXML(decisionXml, error => {
        if (error) {
          console.log('error');
        } else {
          this.setEditor();
        }
      });
    }
  }

  private setEditor(): void {
    const dmnModeler = this.dmnModeler;

    const activeView = dmnModeler.getActiveView();

    // apply initial logic in DRD view
    if (activeView.type === 'drd') {
      const activeEditor = dmnModeler.getActiveViewer();

      // access active editor components
      const canvas = activeEditor.get('canvas');

      // zoom to fit full viewport
      canvas.zoom('fit-viewport');
    }
  }
}
