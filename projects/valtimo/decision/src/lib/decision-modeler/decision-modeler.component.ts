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

import {DecisionService} from '../decision.service';
import {AfterViewInit, Component} from '@angular/core';
import DmnJS from 'dmn-js/dist/dmn-modeler.development.js';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {DecisionXml} from '../models';
import {migrateDiagram} from '@bpmn-io/dmn-migrate';
import {LayoutService} from '@valtimo/layout';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  from,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  AlertService,
  PageTitleService,
  SelectedValue,
  SelectItem,
  WidgetModule,
} from '@valtimo/components';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {EMPTY_DECISION} from './empty-decision';
import {CommonModule} from '@angular/common';
import {ModalModule, SelectModule} from 'carbon-components-angular';

declare const $: any;

@Component({
  selector: 'valtimo-decision-modeler',
  standalone: true,
  templateUrl: './decision-modeler.component.html',
  styleUrls: ['./decision-modeler.component.scss'],
  imports: [CommonModule, RouterModule, ModalModule, SelectModule, WidgetModule, TranslateModule],
})
export class DecisionModelerComponent implements AfterViewInit {
  private CLASS_NAMES = {
    drd: 'dmn-icon-lasso-tool',
    decisionTable: 'dmn-icon-decision-table',
    literalExpression: 'dmn-icon-literal-expression',
  };
  private $container!: any;
  private $tabs!: any;
  private dmnModeler!: DmnJS;

  readonly versionSelectionDisabled$ = new BehaviorSubject<boolean>(true);
  readonly isCreating$ = new BehaviorSubject<boolean>(false);
  readonly selectionId$ = new BehaviorSubject<string>('');
  readonly createdDecisionVersionSelectItems$ = new BehaviorSubject<Array<SelectItem>>([]);

  private readonly decisionId$ = this.route.params.pipe(
    map(params => params?.id),
    tap(id => {
      this.isCreating$.next(id === 'create');
      this.versionSelectionDisabled$.next(true);
    }),
    filter(id => !!id && id !== 'create')
  );

  readonly decision$ = this.decisionId$.pipe(
    switchMap(id => this.decisionService.getDecisionById(id)),
    tap(decision => {
      if (decision) this.selectionId$.next(decision.id);
    })
  );

  readonly decisionTitle$ = this.decision$.pipe(
    map(d => d?.key || ''),
    tap(title => this.pageTitleService.setCustomPageTitle(title))
  );

  readonly decisionVersionSelectItems$ = combineLatest([
    this.decision$,
    this.decisionService.getDecisions(),
    this.createdDecisionVersionSelectItems$,
  ]).pipe(
    map(([current, list, created]) => {
      const filtered = list.filter(d => d.key === current.key);
      return [...filtered.map(d => ({id: d.id, text: d.version.toString()})), ...created].sort(
        (a, b) => +b.text - +a.text
      );
    }),
    tap(() => this.versionSelectionDisabled$.next(false))
  );

  readonly decisionXml$ = this.decisionId$.pipe(
    switchMap(id => this.decisionService.getDecisionXml(id)),
    tap(xml => xml && this.loadDecisionXml(xml))
  );

  constructor(
    private readonly decisionService: DecisionService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly translateService: TranslateService,
    public readonly layoutService: LayoutService,
    private readonly pageTitleService: PageTitleService
  ) {}

  ngAfterViewInit(): void {
    this.setProperties();
    this.setTabEvents();
    this.setModelerEvents();
  }

  switchVersion(decisionId: string | SelectedValue): void {
    if (decisionId) this.router.navigate(['/decision-tables/edit', decisionId]);
  }

  deploy(): void {
    from(this.dmnModeler.saveXML({format: true}))
      .pipe(
        map(result => new File([(result as any).xml], 'decision.dmn', {type: 'text/xml'})),
        switchMap(file => this.decisionService.deployDmn(file)),
        tap(res => {
          const deployed = res.deployedDecisionDefinitions;
          const id = deployed[Object.keys(deployed)[0]]?.id;
          if (!id) return;
          this.createdDecisionVersionSelectItems$.pipe(take(1)).subscribe(existing => {
            this.createdDecisionVersionSelectItems$.next([
              ...existing,
              {id, text: deployed[id].version.toString()},
            ]);
            setTimeout(() => {
              this.switchVersion(id);
              this.alertService.success(this.translateService.instant('decisions.deploySuccess'));
            });
          });
        }),
        catchError(() => {
          this.alertService.error(this.translateService.instant('decisions.deployFailure'));
          return of(null);
        })
      )
      .subscribe();
  }

  download(): void {
    from(this.dmnModeler.saveXML({format: true}))
      .pipe(
        map(result => new File([(result as any).xml], 'decision.dmn', {type: 'text/xml'})),
        tap(file => {
          const link = document.createElement('a');
          link.download = 'diagram.dmn';
          link.href = window.URL.createObjectURL(file);
          link.click();
          window.URL.revokeObjectURL(link.href);
          link.remove();
        })
      )
      .subscribe();
  }

  private setProperties(): void {
    const isCreating = this.isCreating$.getValue();
    this.$container = $('.editor-container');
    this.$tabs = $('.editor-tabs');
    this.dmnModeler = new DmnJS({
      container: this.$container,
      height: 500,
      width: '100%',
      keyboard: {bindTo: window},
    });
    if (isCreating) this.loadEmptyDecisionTable();
  }

  private loadEmptyDecisionTable(): void {
    this.loadDecisionXml(EMPTY_DECISION);
  }

  private setTabEvents(): void {
    this.$tabs.delegate(
      '.tab',
      'click',
      async function () {
        const index = +this.getAttribute('data-id');
        const view = this.dmnModeler.getViews()[index];
        try {
          await this.dmnModeler.open(view);
        } catch (err) {
          console.error('tab open error', err);
        }
      }.bind(this)
    );
  }

  private setModelerEvents(): void {
    this.dmnModeler.on('views.changed', event => {
      const {views, activeView} = event;
      this.$tabs.empty();
      views.forEach((v, i) => {
        const className = this.CLASS_NAMES[v.type];
        const tab = $(
          `<div class="tab ${v === activeView ? 'active' : ''}" data-id="${i}"><span class="${className}"></span>${v.element.name || v.element.id}</div>`
        );
        this.$tabs.append(tab);
      });
    });
  }

  private loadDecisionXml(decision: DecisionXml): void {
    from(this.dmnModeler.importXML(decision.dmnXml))
      .pipe(
        tap(() => this.setEditor()),
        catchError(() => {
          this.migrateAndLoadDecisionXml(decision);
          return of(null);
        })
      )
      .subscribe();
  }

  private migrateAndLoadDecisionXml(decision: DecisionXml): void {
    from(migrateDiagram(decision.dmnXml))
      .pipe(
        switchMap(xml => this.dmnModeler.importXML(xml)),
        tap(() => this.setEditor()),
        catchError(() => {
          this.alertService.error(this.translateService.instant('decisions.loadFailure'));
          return of(null);
        })
      )
      .subscribe();
  }

  private setEditor(): void {
    const view = this.dmnModeler.getActiveView();
    if (view?.type === 'drd') {
      const canvas = this.dmnModeler.getActiveViewer().get('canvas');
      canvas.zoom('fit-viewport');
    }
  }
}
