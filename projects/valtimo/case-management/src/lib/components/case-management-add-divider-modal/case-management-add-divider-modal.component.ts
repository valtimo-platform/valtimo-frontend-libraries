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
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {
  ButtonModule,
  IconModule,
  InputModule,
  ModalModule,
  ProgressIndicatorModule,
  TooltipModule,
} from 'carbon-components-angular';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {StatusModalCloseEvent} from '../../models';

@Component({
  selector: 'valtimo-case-management-add-divider-modal',
  templateUrl: './case-management-add-divider-modal.component.html',
  styleUrls: ['./case-management-add-divider-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ModalModule,
    ButtonModule,
    IconModule,
    InputModule,
    TooltipModule,
    ReactiveFormsModule
  ],
})
export class CaseManagementAddDividerModalComponent {
  @Input() public open;

  @Output() public closeModalEvent = new EventEmitter<any>();

  public readonly editDisabled$ = new BehaviorSubject<boolean>(true);
  public readonly editActive$ = new BehaviorSubject<boolean>(false);
  public readonly idError$ = new BehaviorSubject<string | null>(null);

  public readonly addDivider = this.fb.group({
    title: this.fb.control(''),
    key: this.fb.control(''),
  });

  constructor(
    private readonly translateService: TranslateService,
    private readonly fb: FormBuilder,
  ) {}

  public onCloseModal(): void {
    this.closeModalEvent.emit(null);
  }

  public enableEdit(): void {
    this.editActive$.next(true);
  }
}
