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

import {Component, OnInit} from '@angular/core';
import {ProcessService, ProcessDefinition} from '@valtimo/process';
import {Router} from '@angular/router';

@Component({
  selector: 'valtimo-process-management-list',
  templateUrl: './process-management-list.component.html',
  styleUrls: ['./process-management-list.component.scss'],
})
export class ProcessManagementListComponent implements OnInit {
  public processDefinitions: ProcessDefinition[] = [];
  public fields = [
    {key: 'key', label: 'Key'},
    {key: 'name', label: 'Name'},
  ];

  constructor(private processService: ProcessService, private router: Router) {}

  ngOnInit() {
    this.loadProcessDefinitions();
  }

  loadProcessDefinitions() {
    this.processService.getProcessDefinitions().subscribe((processDefs: ProcessDefinition[]) => {
      this.processDefinitions = processDefs;
    });
  }

  editProcessDefinition(processDefinition: ProcessDefinition) {
    this.router.navigate(['/processes/process', processDefinition.key]);
  }
}
