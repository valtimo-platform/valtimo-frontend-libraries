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

import {Component} from '@angular/core';
import {StepperService} from '../../../services/stepper.service';
import {BehaviorSubject, Observable} from 'rxjs';

@Component({
  selector: 'v-stepper-footer-step',
  templateUrl: './stepper-footer-step.component.html',
  styleUrls: ['./stepper-footer-step.component.scss'],
})
export class StepperFooterStepComponent {
  public stepIndex$ = new BehaviorSubject<number>(-1);

  currentStepIndex$: Observable<number> = this.stepperService.currentStepIndex$;

  constructor(private readonly stepperService: StepperService) {}

  goToNextStep(): void {
    this.stepperService.goToNextStep();
  }

  cancel(): void {
    this.stepperService.cancel();
  }
}
