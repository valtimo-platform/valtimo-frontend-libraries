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
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import * as React from 'react';
import {Button, ButtonProps} from '@carbon/react';
import {createRoot, Root} from 'react-dom/client';
import {DOCUMENT} from '@angular/common';
import {Parser as HtmlToReactParser} from 'html-to-react';
import {VcdsContentDirective} from '../../directives';

@Component({
  selector: 'vcds-button',
  encapsulation: ViewEncapsulation.None,
  template: '',
  standalone: true,
})
export class VcdsButtonComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ContentChild(VcdsContentDirective, {
    read: ElementRef,
    descendants: true,
  })
  contentChild!: ElementRef<HTMLDivElement>;
  @Input() public disabled!: ButtonProps<any>['disabled'];
  @Output() public onClick = new EventEmitter<void>();

  private _root!: Root;
  private readonly _HTML_TO_REACT_PARSER = HtmlToReactParser();

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  public ngAfterViewInit() {
    this._root = createRoot(this.elementRef.nativeElement);
    this.render();
  }

  public ngOnChanges(): void {
    this.render();
  }

  public ngOnDestroy() {
    this._root.unmount();
  }

  private handleOnClick = () => {
    this.onClick.emit();
    this.render();
  };

  private render() {
    const {disabled} = this;
    const content = this.contentChild?.nativeElement.innerHTML;

    this._root?.render(
      <Button
        onClick={this.handleOnClick}
        disabled={disabled}
        children={this._HTML_TO_REACT_PARSER.parse(content)}
      ></Button>
    );
  }
}
