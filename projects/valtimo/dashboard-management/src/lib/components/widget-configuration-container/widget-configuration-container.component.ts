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
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {
  ConfigurationComponent,
  DataSourceConfigurationComponent,
  DisplayTypeConfigurationComponent,
  WidgetService,
} from '@valtimo/dashboard';

@Component({
  selector: 'valtimo-widget-configuration-container',
  templateUrl: './widget-configuration-container.component.html',
  styleUrls: ['./widget-configuration-container.component.scss'],
})
export class WidgetConfigurationContainerComponent
  implements OnInit, OnDestroy, ConfigurationComponent
{
  @ViewChild('widgetConfigurationComponent', {static: true, read: ViewContainerRef})
  public readonly dynamicContainer: ViewContainerRef;

  @Input() set dataSourceKey(value: string) {
    this._dataSourceKey$.next(value);
  }
  @Input() set displayTypeKey(value: string) {
    this._displayTypeKey$.next(value);
  }
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() prefillConfiguration$: Observable<any>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<object> = new EventEmitter<object>();

  public readonly noConfigurationComponentAvailable$ = new BehaviorSubject<boolean>(false);

  private _componentRefSubscription!: Subscription;
  private _configurationComponentSubscription!: Subscription;
  private _validSubscription!: Subscription;
  private _configurationSubscription!: Subscription;

  private readonly _componentRef$ = new BehaviorSubject<
    ComponentRef<DataSourceConfigurationComponent | DisplayTypeConfigurationComponent> | undefined
  >(undefined);
  private readonly _dataSourceKey$ = new BehaviorSubject<string>('');
  private readonly _displayTypeKey$ = new BehaviorSubject<string>('');

  constructor(private readonly widgetService: WidgetService) {}

  public ngOnInit(): void {
    this.openConfigurationComponentSubscription();
    this.openComponentInstanceSubscription();
  }

  public ngOnDestroy(): void {
    this._configurationComponentSubscription?.unsubscribe();
    this._componentRefSubscription?.unsubscribe();
  }

  private openConfigurationComponentSubscription(): void {
    this._configurationComponentSubscription = combineLatest([
      this._displayTypeKey$,
      this._dataSourceKey$,
      this.widgetService.supportedDisplayTypes$,
      this.widgetService.supportedDataSources$,
    ])
      .pipe(
        tap(([displayTypeKey, dataSourceKey, supportedDisplayTypes, supportedDataSources]) => {
          let configurationComponent!: Type<
            DisplayTypeConfigurationComponent | DataSourceConfigurationComponent
          >;

          this.dynamicContainer.clear();

          const displayTypeSpecification =
            displayTypeKey &&
            supportedDisplayTypes.find(type => type.displayTypeKey === displayTypeKey);
          const dataSourceSpecification =
            dataSourceKey &&
            supportedDataSources.find(source => source.dataSourceKey === dataSourceKey);

          if (displayTypeSpecification && displayTypeSpecification.configurationComponent) {
            configurationComponent = displayTypeSpecification.configurationComponent;
          } else if (dataSourceSpecification && dataSourceSpecification.configurationComponent) {
            configurationComponent = dataSourceSpecification.configurationComponent;
          }

          if (configurationComponent) {
            const componentRef = this.dynamicContainer.createComponent(configurationComponent);
            this._componentRef$.next(componentRef);
            this.noConfigurationComponentAvailable$.next(false);
          } else {
            this.noConfigurationComponentAvailable$.next(true);
          }
        })
      )
      .subscribe();
  }

  private openComponentInstanceSubscription(): void {
    this._componentRefSubscription = combineLatest([
      this._componentRef$,
      this._dataSourceKey$,
      this._displayTypeKey$,
    ]).subscribe(([ref, dataSourceKey, displayTypeKey]) => {
      const instance = ref?.instance;

      this._configurationSubscription?.unsubscribe();
      this._validSubscription?.unsubscribe();

      if (instance) {
        instance.save$ = this.save$;
        instance.disabled$ = this.disabled$;

        if (displayTypeKey) {
          (instance as DisplayTypeConfigurationComponent).displayTypeKey = displayTypeKey;
        } else if (dataSourceKey) {
          (instance as DataSourceConfigurationComponent).dataSourceKey = dataSourceKey;
        }

        if (this.prefillConfiguration$) {
          instance.prefillConfiguration$ = this.prefillConfiguration$;
        }

        this._validSubscription = instance.valid.subscribe(valid => {
          this.valid.emit(valid);
        });

        this._configurationSubscription = instance.configuration.subscribe(configuration => {
          this.configuration.emit(configuration);
        });
      }
    });
  }
}
