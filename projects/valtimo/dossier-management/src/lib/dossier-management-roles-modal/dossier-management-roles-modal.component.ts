/*
 * Copyright 2015-2022 Ritense BV, the Netherlands.
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
import {IDropdownSettings} from 'ng-multiselect-dropdown';
import {BehaviorSubject} from 'rxjs';
import {Authority, AuthorityService} from '@valtimo/authority';

@Component({
  selector: 'valtimo-dossier-management-roles-modal',
  templateUrl: './dossier-management-roles-modal.component.html',
  styleUrls: ['./dossier-management-roles-modal.component.scss'],
})
export class DossierManagementRolesModalComponent implements OnInit {
  public dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'name',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    enableCheckAll: true,
    allowSearchFilter: true,
  };
  public roles = new BehaviorSubject<Array<Authority>>(undefined);

  constructor(private readonly authorityService: AuthorityService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.authorityService.query().subscribe(result => {
      this.roles.next(result.body);
    });
  }

  onSelectedItems(data: any) {
    console.log('Selected the following items:');
    console.log(data);
  }
}
