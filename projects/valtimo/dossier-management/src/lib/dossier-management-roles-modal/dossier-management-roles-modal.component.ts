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
import {Component, Input, OnInit} from '@angular/core';
import {IDropdownSettings} from 'ng-multiselect-dropdown';
import {BehaviorSubject} from 'rxjs';
import {Authority, AuthorityService} from '@valtimo/authority';
import {DocumentService} from '@valtimo/document';
import {AlertService} from '@valtimo/components';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'valtimo-dossier-management-roles-modal',
  templateUrl: './dossier-management-roles-modal.component.html',
  styleUrls: ['./dossier-management-roles-modal.component.scss'],
})
export class DossierManagementRolesModalComponent implements OnInit {
  @Input() public documentDefinitionName: string;
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
  public preSelectedItems = new BehaviorSubject<Array<String>>(undefined);

  constructor(
    private readonly authorityService: AuthorityService,
    private readonly documentService: DocumentService,
    private readonly alertService: AlertService,
    private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // First load all the roles. Then load the roles already set for this dossier
    this.loadAllRoles();
    this.loadDocumentRoles();
  }

  loadAllRoles() {
    this.authorityService.query().subscribe(result => {
      this.roles.next(result.body);
      //this.loadDocumentRoles();
    });
  }

  loadDocumentRoles() {
    this.documentService.getDocumentRoles(this.documentDefinitionName).subscribe(
      result => {
        this.preSelectedItems.next(result);
      },
      err => {
        this.alertService.warning('Failed to retrieve the current document roles');
      }
    );
  }

  onSelectedItems(data: any) {
    console.log('Selected the following items:');
    console.log(data);
    this.documentService.modifyDocumentRoles(this.documentDefinitionName, data).subscribe(
      () => {
        this.alertService.success(
          this.translateService.instant('documentDefinitionRoles.successfullyStored')
        );
      },
      err => {
        this.alertService.error(
          this.translateService.instant('documentDefinitionRoles.unsuccessfullyStored')
        );
      }
    );
  }
}
