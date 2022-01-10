/*
 * Copyright 2020 Dimpact.
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

import {Component, ViewChild} from '@angular/core';
import {ModalComponent} from '@valtimo/components';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'valtimo-email-extension',
  templateUrl: './email-extension.component.html',
  styleUrls: ['./email-extension.component.scss']
})
export class EmailExtensionComponent {
  @ViewChild('modal') modal: ModalComponent;

  private readonly documentId: string;

  constructor(
    private route: ActivatedRoute,
  ) {
    const snapshot = this.route.snapshot.paramMap;
    this.documentId = snapshot.get('documentId') || '';
  }

  buttonClick(): void {
    this.modal.show();
  }
}
