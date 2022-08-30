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
import {ActivatedRoute} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {DecisionXml} from '../models';
import {migrateDiagram} from '@bpmn-io/dmn-migrate';
import {LayoutService} from '@valtimo/layout';

declare var $: any;

@Component({
  selector: 'valtimo-decision-modeler',
  templateUrl: './decision-modeler.component.html',
  styleUrls: ['./decision-modeler.component.scss'],
})
export class DecisionModelerComponent implements AfterViewInit {


  private diagramUrl = 'https://cdn.staticaly.com/gh/bpmn-io/dmn-js-examples/a71e16/starter/diagram.dmn';
  private CLASS_NAMES = {
    drd: 'dmn-icon-lasso-tool',
    decisionTable: 'dmn-icon-decision-table',
    literalExpression: 'dmn-icon-literal-expression',
  };
  private $container!: any;
  private $tabs!: any;
  private dmnModeler!: DmnJS;
  private decisionId!: string;
  private decisionXml!: string;

  constructor(
    private readonly decisionService: DecisionService,
    private readonly route: ActivatedRoute,
    private readonly toasterService: ToastrService,
    public layoutService: LayoutService
  ) {
  }

  ngAfterViewInit(): void {
    this.setProperties();
    this.setTabEvents();
    this.setModelerEvents();
    this.setDecisionId();
    this.loadDecisionXml();
    $('#save-button').click(this.exportDiagram);
  }

  exportDiagram = async () => {
    try {
      const {xml} = await this.dmnModeler.saveXML({format: true});

      alert('Diagram exported. Check the developer tools!');

      console.log('DIAGRAM', xml);
    } catch (err) {
      console.error('could not save DMN 1.3 diagram', err);
    }
  };

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
            <div class='tab ${v === activeView ? 'active' : ''}' data-id='${idx}'>
              <span class='${className}'></span>
              ${v.element.name || v.element.id}
            </div>
          `);

        $tabs.append(tab);
      });
    });
  };

  private setDecisionId(): void {
    this.decisionId = this.route.snapshot.paramMap.get('id');
  }

  private loadDecisionXml(): void {
    this.decisionService.getDecisionXml(this.decisionId).subscribe((decision: DecisionXml) => {
      this.dmnModeler.importXML(decision.dmnXml, error => {
        if (error) {
          this.migrateAndLoadDecisionXml(decision);
        } else {
          this.setEditor();
        }
      });
      this.decisionXml = decision.dmnXml;
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
      this.decisionXml = decisionXml;
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
