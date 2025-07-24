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
import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {ButtonModule, InputModule, LayerModule, ModalModule} from 'carbon-components-angular';
import {TranslateModule} from '@ngx-translate/core';
import {IkoManagementApiService} from '../../../../services';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CARBON_CONSTANTS, ValtimoCdsModalDirective} from '@valtimo/components';
import {IkoListColumnModalType} from '../../../../models';

@Component({
  standalone: true,
  selector: 'valtimo-iko-management-list-modal',
  templateUrl: './list-modal.component.html',
  styleUrls: ['./list-modal.component.scss'],
  imports: [
    CommonModule,
    TranslateModule,
    ModalModule,
    ValtimoCdsModalDirective,
    ButtonModule,
    InputModule,
    ReactiveFormsModule,
    LayerModule,
  ],
})
export class IkoManagementListModalComponent {
  public readonly $openModal = signal<boolean>(false);
  @Input() public set openModal(value: boolean) {
    this.$openModal.set(value);
  }

  public readonly $type = signal<IkoListColumnModalType>(IkoListColumnModalType.ADD);
  @Input() public set type(value: IkoListColumnModalType) {
    this.$type.set(value);
  }

  @Output() public readonly closeModalEvent = new EventEmitter<void>();

  public readonly form = this.formBuilder.group({
    title: this.formBuilder.control('', [Validators.required]),
    key: this.formBuilder.control('', [Validators.required]),
    path: this.formBuilder.control('', [Validators.required]),
    displayTypeType: this.formBuilder.control('', [Validators.required]),
    displayTypeParameters: this.formBuilder.control('', [Validators.required]),
    sortable: this.formBuilder.control(false, [Validators.required]),
    defaultSort: this.formBuilder.control('', [Validators.required]),
  });

  constructor(
    private readonly ikoManagementApiService: IkoManagementApiService,
    private readonly formBuilder: FormBuilder
  ) {}

  public closeModal(): void {
    this.closeModalEvent.emit();

    setTimeout(() => {
      this.form.reset();
    }, CARBON_CONSTANTS.modalAnimationMs);
  }

  public addColumn(): void {
    console.log(event);
  }
}
