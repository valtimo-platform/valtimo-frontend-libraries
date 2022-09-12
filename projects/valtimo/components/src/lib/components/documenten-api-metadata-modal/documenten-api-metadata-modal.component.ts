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

import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalComponent, ModalService} from '@valtimo/user-interface';
import {Observable, Subscription} from 'rxjs';
import {DocumentenApiMetadata} from '../../models';

@Component({
  selector: 'valtimo-documenten-api-metadata-modal',
  templateUrl: './documenten-api-metadata-modal.component.html',
  styleUrls: ['./documenten-api-metadata-modal.component.scss'],
})
export class DocumentenApiMetadataModalComponent implements OnInit, OnDestroy {
  @ViewChild('documentenApiMetadataModal') documentenApiMetadataModal: ModalComponent;

  @Input() disabled = false;
  @Input() show$!: Observable<null>;
  @Input() hide$!: Observable<null>;
  @Input() disabled$!: Observable<boolean>;
  @Input() file$!: Observable<File>;

  private showSubscription!: Subscription;
  private hideSubscription!: Subscription;

  constructor(private readonly modalService: ModalService) {}

  ngOnInit(): void {
    this.openShowSubscription();
    this.openHideSubscription();
  }

  ngOnDestroy(): void {
    this.showSubscription?.unsubscribe();
    this.hideSubscription?.unsubscribe();
  }

  hide(): void {
    this.modalService.closeModal();
  }

  cancel(): void {
    console.log('cancel');
  }

  save(): void {
    console.log('save');
  }

  formValueChange(data: DocumentenApiMetadata): void {
    console.log('data', data);
  }

  private openShowSubscription(): void {
    this.showSubscription = this.show$.subscribe(() => {
      this.modalService.openModal(this.documentenApiMetadataModal);
    });
  }

  private openHideSubscription(): void {
    this.hideSubscription = this.hide$.subscribe(() => {
      this.hide();
    });
  }
}
