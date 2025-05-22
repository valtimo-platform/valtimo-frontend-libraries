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

import {AfterViewInit, Directive, ElementRef, Renderer2} from '@angular/core';

@Directive({
  selector: '[muuriItem]',
  standalone: false,
})
export class MuuriItemDirective implements AfterViewInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    const hostElement = this.el.nativeElement;

    // Create wrapper divs
    const outerDiv = this.renderer.createElement('div');
    this.renderer.addClass(outerDiv, 'item');

    const innerDiv = this.renderer.createElement('div');
    this.renderer.addClass(innerDiv, 'item-content');

    // Insert wrapper before host element
    const parent = hostElement.parentNode;
    this.renderer.insertBefore(parent, outerDiv, hostElement);

    // Move host element inside inner wrapper
    this.renderer.appendChild(innerDiv, hostElement);
    this.renderer.appendChild(outerDiv, innerDiv);
  }
}
