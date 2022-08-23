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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {delay} from 'rxjs/operators';
import {PromptService} from '../../services/prompt.service';

@Component({
  selector: 'v-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss'],
})
export class PromptComponent implements OnInit {
  @Input() appearingDelayMs = 140;
  @Input() maxWidthPx!: number;

  @Output() closeEvent: EventEmitter<any> = new EventEmitter();

  readonly visible$: Observable<boolean> = this.promptService.promptVisible$;
  readonly showBackdrop$: Observable<boolean> = this.visible$.pipe(delay(0));
  readonly appearing$ = this.promptService.appearing$;
  readonly disappearing$ = this.promptService.disappearing$;
  readonly mouseInsideModal$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly promptService: PromptService) {}

  ngOnInit(): void {
    this.setAppearingDelayInService();
  }

  closeModal(): void {
    this.closeEvent.emit();
    this.promptService.closePrompt();
  }

  modalMouseEnter(): void {
    this.mouseInsideModal$.next(true);
  }

  modalMouseLeave(): void {
    this.mouseInsideModal$.next(false);
  }

  private setAppearingDelayInService(): void {
    this.promptService.setAppearingDelay(this.appearingDelayMs);
  }
}
