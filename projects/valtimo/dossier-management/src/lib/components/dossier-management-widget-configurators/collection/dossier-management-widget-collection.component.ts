/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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
import {CommonModule} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewEncapsulation,
  WritableSignal,
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CARBON_THEME, CdsThemeService, CurrentCarbonTheme} from '@valtimo/components';
import {
  CollectionFieldWidth,
  FieldsCaseWidgetValue,
  WidgetCollectionContent,
  WidgetContentProperties,
} from '@valtimo/dossier';
import {DropdownModule, InputModule, ListItem} from 'carbon-components-angular';
import {map, Observable, Subscription} from 'rxjs';
import {WidgetContentComponent} from '../../../models';
import {WidgetWizardService} from '../../../services';
import {DossierManagementWidgetFieldsColumnComponent} from '../fields/column/dossier-management-widget-fields-column.component';

@Component({
  templateUrl: './dossier-management-widget-collection.component.html',
  styleUrl: './dossier-management-widget-collection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DossierManagementWidgetFieldsColumnComponent,
    ReactiveFormsModule,
    InputModule,
    DropdownModule,
  ],
})
export class DossierManagementWidgetCollectionComponent
  implements WidgetContentComponent, OnInit, OnDestroy
{
  @HostBinding('class') public readonly class = 'valtimo-dossier-management-widget-collection';
  @Output() public readonly changeValidEvent = new EventEmitter<boolean>();

  public form = this.fb.group({
    title: this.fb.control(this.widgetWizardService.widgetTitle() ?? '', Validators.required),
    defaultPageSize: this.fb.control(
      (this.widgetWizardService.widgetContent() as WidgetCollectionContent)?.defaultPageSize ?? 5,
      Validators.required
    ),
    collection: this.fb.control(
      (this.widgetWizardService.widgetContent() as WidgetCollectionContent)?.collection ?? '',
      Validators.required
    ),
  });

  public readonly theme$: Observable<CARBON_THEME> = this.cdsThemeService.currentTheme$.pipe(
    map((theme: CurrentCarbonTheme) =>
      theme === CurrentCarbonTheme.G10 ? CARBON_THEME.WHITE : CARBON_THEME.G90
    )
  );

  public readonly content = this.widgetWizardService
    .widgetContent as WritableSignal<WidgetCollectionContent>;

  public WIDTH_ITEMS: ListItem[] = [
    {
      content: this.translateService.instant('widgetTabManagement.width.fullWidth.title'),
      id: 'full',
      selected: true,
    },
    {
      content: this.translateService.instant('widgetTabManagement.width.half.title'),
      id: 'half',
      selected: false,
    },
  ];

  private readonly _subscriptions = new Subscription();
  private readonly _contentValid = signal<boolean>(false);

  constructor(
    private readonly cdsThemeService: CdsThemeService,
    private readonly fb: FormBuilder,
    private readonly translateService: TranslateService,
    private readonly widgetWizardService: WidgetWizardService
  ) {}

  public ngOnInit(): void {
    this._subscriptions.add(
      this.form.valueChanges.subscribe(value => {
        this.widgetWizardService.widgetTitle.set(value?.title ?? '');

        this.widgetWizardService.widgetContent.update(
          (content: WidgetContentProperties | null) =>
            ({
              ...content,
              collection: value?.collection || '',
              defaultPageSize: value?.defaultPageSize || 5,
            }) as WidgetCollectionContent
        );

        this.changeValidEvent.emit(this.form.valid && this._contentValid());
      })
    );
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  public getSelectedWidthItem(fieldIndex: number): ListItem[] {
    const widgetContent: WidgetCollectionContent | null =
      this.widgetWizardService.widgetContent() as WidgetCollectionContent;

    return !widgetContent
      ? this.WIDTH_ITEMS
      : this.WIDTH_ITEMS.map((item: ListItem) => ({
          ...item,
          selected: widgetContent.fields?.[fieldIndex]?.width === item.id,
        }));
  }

  public onColumnUpdateEvent(event: {data: FieldsCaseWidgetValue[]; valid: boolean}): void {
    const {data, valid} = event;
    this.widgetWizardService.widgetContent.update((content: WidgetContentProperties | null) => {
      const existingFields = (content as WidgetCollectionContent)?.fields;

      return {
        ...content,
        fields: data.map((item, index) => ({
          ...item,
          width: existingFields?.[index]?.width ?? 'full',
        })),
      } as WidgetCollectionContent;
    });
    this._contentValid.set(valid);
    this.changeValidEvent.emit(valid && this.form.valid);
  }

  public onWidthSelected(event: {item: ListItem}, fieldIndex: number): void {
    this.widgetWizardService.widgetContent.update(
      (content: WidgetContentProperties | null) =>
        ({
          ...content,
          fields: (content as WidgetCollectionContent)?.fields.map(
            (field: FieldsCaseWidgetValue & {width: CollectionFieldWidth}, index: number) =>
              index === fieldIndex ? {...field, width: event.item.id} : field
          ),
        }) as WidgetCollectionContent
    );
  }
}
