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
  @Output() complete: EventEmitter<any> = new EventEmitter();
  @Output() nextStep: EventEmitter<number> = new EventEmitter();

  private cancelSubscription!: Subscription;
  private completeSubscription!: Subscription;
  private nextStepSubscription!: Subscription;

  constructor(private readonly stepperService: StepperService) {}

  ngOnInit(): void {
    this.openCancelSubscription();
    this.openCompleteSubscription();
    this.openNextStepSubscription();
  }

  ngOnDestroy(): void {
    this.cancelSubscription?.unsubscribe();
    this.completeSubscription?.unsubscribe();
    this.nextStepSubscription?.unsubscribe();
  }

  private openCancelSubscription(): void {
    this.cancelSubscription = this.stepperService.cancel$.subscribe(() => {
      this.cancel.emit();
    });
  }

  private openCompleteSubscription(): void {
    this.completeSubscription = this.stepperService.complete$.subscribe(() => {
      this.complete.emit();
    });
  }

  private openNextStepSubscription(): void {
    this.nextStepSubscription = this.stepperService.nextStep$.subscribe(currentStepIndex => {
      this.nextStep.emit(currentStepIndex);
    });
  }
}
