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

import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {StepperService} from '../../../services/stepper.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'v-stepper-container',
  templateUrl: './stepper-container.component.html',
  styleUrls: ['./stepper-container.component.scss'],
  providers: [StepperService],
})
export class StepperContainerComponent implements OnInit, OnDestroy {
  @Output() cancel: EventEmitter<any> = new EventEmitter();

  private cancelSubscription!: Subscription;

  constructor(private readonly stepperService: StepperService) {}

  ngOnInit(): void {
    this.cancelSubscription = this.stepperService.cancel$.subscribe(cancel => {
      if (cancel) {
        this.cancel.emit();
      }
    });
  }

  ngOnDestroy(): void {
    this.cancelSubscription?.unsubscribe();
  }
}
