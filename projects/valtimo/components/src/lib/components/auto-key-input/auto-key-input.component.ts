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

import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  signal,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ButtonModule, InputModule} from 'carbon-components-angular';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {ModalMode} from '@valtimo/shared';

@Component({
  selector: 'valtimo-auto-key-input',
  standalone: true,
  templateUrl: './auto-key-input.component.html',
  styleUrls: ['./auto-key-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputModule, ButtonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoKeyInputComponent),
      multi: true,
    },
  ],
})
export class AutoKeyInputComponent implements ControlValueAccessor, OnDestroy {
  @Input() public label: string = 'Key';
  @Input() public placeholder: string = '';

  public readonly mode$ = new BehaviorSubject<ModalMode>('add');
  @Input() public set mode(value: ModalMode) {
    this.mode$.next(value);
  }

  private readonly _usedKeys$ = new BehaviorSubject<string[]>([]);
  @Input() public set usedKeys(value: string[]) {
    this._usedKeys$.next(value || []);
  }

  private readonly _sourceText$ = new BehaviorSubject<string>('');
  @Input() public set sourceText(value: string) {
    this._sourceText$.next(value || '');
  }

  public $disabled = signal<boolean>(false);

  public value = '';

  public readonly editingKey$ = new BehaviorSubject<boolean>(true);

  private onChange = (_: any) => {};
  public onTouched = () => {};

  private readonly subscription = new Subscription();

  constructor() {
    this.subscription.add(
      this.mode$.subscribe(mode => {
        this.editingKey$.next(mode === 'edit');
      })
    );

    this.subscription.add(
      combineLatest([this.mode$, this.editingKey$, this._usedKeys$, this._sourceText$]).subscribe(
        ([mode, editingKey, usedKeys, sourceText]) => {
          if (mode === 'add' && !editingKey) {
            const newKey = sourceText ? this.getUniqueKey(sourceText, usedKeys) : '';
            this.value = newKey;
            this.onChange(newKey);
          }
        }
      )
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public setDisabledState(disabled: boolean): void {
    this.$disabled.set(disabled);
  }

  public writeValue(value: string): void {
    this.value = value ?? '';
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public onInputChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.value = inputValue;
    this.onChange(inputValue);
  }

  public enableKeyEditing(): void {
    this.editingKey$.next(true);
  }

  private getUniqueKey(sourceText: string, usedKeys: string[]): string {
    const baseKey = sourceText
      .toLowerCase()
      .replace(/[^a-z0-9-_]+|-[^a-z0-9]+/g, '-')
      .replace(/_[-_]+/g, '_')
      .replace(/^[^a-z]+/g, '');

    if (!usedKeys.includes(baseKey)) {
      return baseKey;
    }

    return this.getUniqueKeyWithNumber(baseKey, usedKeys);
  }

  private getUniqueKeyWithNumber(base: string, usedKeys: string[], suffix: number = 1): string {
    const newKey = `${base}-${suffix}`;
    if (usedKeys.includes(newKey)) {
      return this.getUniqueKeyWithNumber(base, usedKeys, suffix + 1);
    }
    return newKey;
  }
}
