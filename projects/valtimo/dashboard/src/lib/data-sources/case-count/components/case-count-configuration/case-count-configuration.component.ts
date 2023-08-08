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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {ConfigurationOutput, DataSourceConfigurationComponent} from '../../../../models';
import {BehaviorSubject, combineLatest, map, Observable, startWith, Subscription} from 'rxjs';
import {FormBuilder, Validators} from '@angular/forms';
import {CaseCountConfiguration, Operator} from '../../models';
import {DocumentService} from '@valtimo/document';
import {ListItem} from 'carbon-components-angular';
import {MultiInputKeyValue, MultiInputValues} from '@valtimo/components';
import {TranslateService} from '@ngx-translate/core';
import {WidgetTranslationService} from '../../../../services';

@Component({
  templateUrl: './case-count-configuration.component.html',
  styleUrls: ['./case-count-configuration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseCountConfigurationComponent
  implements OnInit, OnDestroy, DataSourceConfigurationComponent
{
  public readonly form = this.fb.group({
    documentDefinition: this.fb.control(null, [Validators.required]),
    conditions: this.fb.control(null, [Validators.required]),
  });

  @Input() dataSourceKey: string;

  @Input() set disabled(disabledValue: boolean) {
    if (disabledValue) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  private readonly _selectedDocumentDefinition$ = new BehaviorSubject<string>('');

  public readonly documentItems$: Observable<Array<ListItem>> = combineLatest([
    this.documentService.getAllDefinitions(),
    this._selectedDocumentDefinition$,
  ]).pipe(
    map(([documentDefinitions, selectedDocumentDefintion]) =>
      documentDefinitions.content.map(definition => ({
        content: definition.id.name,
        selected: definition.id.name === selectedDocumentDefintion,
      }))
    )
  );

  private readonly _OPERATORS: Array<Operator> = [
    Operator.NOT_EQUAL_TO,
    Operator.EQUAL_TO,
    Operator.GREATER_THAN,
    Operator.GREATER_THAN_OR_EQUAL_TO,
    Operator.LESS_THAN,
    Operator.LESS_THAN_OR_EQUAL_TO,
  ];

  public readonly operatorItems$: Observable<Array<ListItem>> = this.translateService
    .stream('key')
    .pipe(
      map(() =>
        this._OPERATORS.map(operator => ({
          id: operator,
          content: this.widgetTranslationService.instant(operator, this.dataSourceKey),
          selected: false,
        }))
      )
    );

  public readonly defaultConditionValues$ = new BehaviorSubject<MultiInputValues | null>(null);

  public get documentDefinition() {
    return this.form.get('documentDefinition');
  }

  public get conditions() {
    return this.form.get('conditions');
  }

  @Input() set prefillConfiguration(configurationValue: CaseCountConfiguration) {
    if (configurationValue) {
      this.documentDefinitionSelected({
        item: {
          content: configurationValue.documentDefinition,
        },
      } as any);
      this.defaultConditionValues$.next(
        configurationValue.conditions.map(condition => ({
          key: condition.queryPath,
          dropdown: condition.queryOperator,
          value: condition.queryValue,
        }))
      );
    }
  }

  @Output() public configurationEvent = new EventEmitter<ConfigurationOutput>();

  private _subscriptions = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly documentService: DocumentService,
    private readonly translateService: TranslateService,
    private readonly widgetTranslationService: WidgetTranslationService
  ) {}

  public ngOnInit(): void {
    this.openFormSubscription();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public documentDefinitionSelected(documentDefinitionItem: ListItem): void {
    if (!documentDefinitionItem) {
      return;
    }

    this._selectedDocumentDefinition$.next(documentDefinitionItem?.item?.content);
    this.documentDefinition.setValue(documentDefinitionItem?.item?.content);
  }

  public conditionsValueChange(values: Array<MultiInputKeyValue>): void {
    if (values.length === 0) {
      this.conditions.setValue(null);
    } else {
      this.conditions.setValue(
        values.map(value => ({
          queryPath: value.key,
          queryOperator: value.dropdown,
          queryValue: value.value,
        }))
      );
    }
  }

  private openFormSubscription(): void {
    this._subscriptions.add(
      this.form.valueChanges.pipe(startWith(this.form.value)).subscribe(formValue => {
        this.configurationEvent.emit({valid: this.form.valid, data: formValue});
      })
    );
  }
}