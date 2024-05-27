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
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ButtonModule, IconModule, InputModule, TabsModule} from 'carbon-components-angular';

import {WidgetWizardService} from '../../../../services';
import {CdsThemeService, CurrentCarbonTheme} from '@valtimo/components';
import {map} from 'rxjs';

@Component({
  selector: 'valtimo-widget-wizard-content-step',
  templateUrl: './widget-wizard-content-step.component.html',
  styleUrls: ['./widget-wizard-content-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    InputModule,
    TabsModule,
    IconModule,
    ReactiveFormsModule,
    ButtonModule,
  ],
})
export class WidgetWizardContentStepComponent {
  @HostBinding('class') public readonly class = 'valtimo-widget-wizard-content';
  @ViewChild('contentRenderer', {static: true, read: ViewContainerRef})
  private readonly _vcr: ViewContainerRef;

  public form = this.fb.group({
    widgetTitle: this.fb.control('', Validators.required),
  });

  public readonly columns = signal<object[]>([{}]);
  public readonly widgetWidth = this.widgetWizardService.widgetWidth();
  public readonly selectedTabIndex = -1;
  public readonly theme$ = this.cdsThemeService.currentTheme$.pipe(
    map((theme: CurrentCarbonTheme) =>
      theme === CurrentCarbonTheme.G10 ? 'white' : CurrentCarbonTheme.G90
    )
  );

  constructor(
    private readonly cdsThemeService: CdsThemeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly widgetWizardService: WidgetWizardService
  ) {}

  public onAddColumnClick(): void {
    this.columns.update(value => [...value, {columnData: {}}]);
  }

  public onColumnSelected(index: number): void {
    console.log(index);
    this.renderComponent({test: `Component ${index + 1}`});
  }

  public onDeleteColumnClick(index: number): void {
    this.columns.update((columns: object[]) => {
      const temp = columns;
      temp.splice(index, 1);

      return temp;
    });
  }

  private renderComponent(columnData: object): void {
    this._vcr.clear();
    const widget = this.widgetWizardService.selectedWidget();
    if (!widget) return;

    const componentInstance = this._vcr.createComponent(widget.component).instance;
    if (!componentInstance) return;

    componentInstance.columnData = columnData;
    this.cdr.detectChanges();
  }
}
