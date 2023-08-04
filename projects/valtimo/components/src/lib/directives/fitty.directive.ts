/*
 * Copyright 2015-2023 Ritense BV, the Netherlands.
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

import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
} from '@angular/core';
import {FittyEvent} from '../models';
import {fromEvent, Subscription} from 'rxjs';

declare const fitty: any;

@Directive({
  selector: '[fitty]',
})
export class FittyDirective implements AfterViewInit, OnDestroy {
  @Input() public minSize!: number;
  @Input() public maxSize!: number;
  @Output() public fittyChangeEvent = new EventEmitter<FittyEvent>();
  @Output() public elementWidthChangedEvent = new EventEmitter<number>();

  private _fitty!: any;
  private _observer!: ResizeObserver;
  private readonly _subscriptions = new Subscription();

  constructor(private readonly elementRef: ElementRef, private readonly renderer: Renderer2) {}

  ngAfterViewInit() {
    if (!fitty) {
      return;
    }

    this._observer = new ResizeObserver(event => {
      this.observerMutation(event);
    });
    this._observer.observe(this.elementRef.nativeElement);
    this.setFittyStyles();
    this._fitty = fitty(this.elementRef.nativeElement, {
      ...(this.minSize && {minSize: this.minSize}),
      ...(this.maxSize && {maxSize: this.maxSize}),
    });
    this.openFittySubscription();
  }

  ngOnDestroy() {
    this._fitty?.unsubscribe();
    this._observer?.disconnect();
    this._subscriptions.unsubscribe();
  }

  private setFittyStyles(): void {
    this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'inline-block');
    this.renderer.setStyle(this.elementRef.nativeElement, 'white-space', 'no-wrap');
  }

  private openFittySubscription(): void {
    this._subscriptions.add(
      fromEvent(this.elementRef.nativeElement, 'fit').subscribe(event => {
        const fittyEvent = (event as any).detail as FittyEvent;

        if (!fittyEvent) {
          return;
        }

        this.fittyChangeEvent.emit(fittyEvent);
      })
    );
  }

  private observerMutation(event: Array<ResizeObserverEntry>): void {
    const elementWidth = event[0]?.borderBoxSize[0]?.inlineSize;

    if (typeof elementWidth === 'number' && elementWidth !== 0) {
      this.elementWidthChangedEvent.emit(elementWidth);
    }
  }
}
