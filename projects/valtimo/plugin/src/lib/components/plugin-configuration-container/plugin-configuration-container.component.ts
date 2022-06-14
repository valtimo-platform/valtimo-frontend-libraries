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

import {
  Component,
  ComponentRef,
  Input,
  OnDestroy,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {PluginService} from '../../services';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {map, take, tap} from 'rxjs/operators';
import {ConfigurationComponentType, PluginConfigurationComponent} from '../../models';

@Component({
  selector: 'valtimo-plugin-configuration-container',
  templateUrl: './plugin-configuration-container.component.html',
  styleUrls: ['./plugin-configuration-container.component.scss'],
})
export class PluginConfigurationContainerComponent implements OnInit, OnDestroy {
  @ViewChild('pluginConfigurationComponent', {static: true, read: ViewContainerRef})
  public dynamicContainer: ViewContainerRef;

  @Input() set type(type: ConfigurationComponentType) {
    this._componentType.next(type);
  }
  @Input() set pluginDefinitionKey(key: string) {
    this._pluginDefinitionKey.next(key);
  }
  @Input() set functionKey(key: string) {
    this._functionKey.next(key);
  }

  private readonly _componentType = new BehaviorSubject<ConfigurationComponentType | null>(null);
  private readonly _pluginDefinitionKey = new BehaviorSubject<string>('');
  private readonly _functionKey = new BehaviorSubject<string>('');

  readonly noConfigurationComponentAvailable$ = new BehaviorSubject<boolean>(false);
  readonly componentInstance$ = new BehaviorSubject<
    ComponentRef<PluginConfigurationComponent> | undefined
  >(undefined);
  private componentInstanceSubscription!: Subscription;
  private pluginSubscription!: Subscription;

  constructor(private readonly pluginService: PluginService) {}

  ngOnInit(): void {
    this.openPluginSubscription();
    this.openComponentInstanceSubscription();
  }

  ngOnDestroy(): void {
    this.pluginSubscription?.unsubscribe();
    this.componentInstanceSubscription?.unsubscribe();
  }

  private openPluginSubscription(): void {
    this.pluginSubscription = combineLatest([
      this._pluginDefinitionKey,
      this._functionKey,
      this._componentType,
      this.pluginService.pluginSpecifications$,
    ])
      .pipe(
        tap(([pluginDefinitionKey, functionKey, componentType, pluginSpecifications]) => {
          let configurationComponent!: Type<PluginConfigurationComponent>;

          this.dynamicContainer.clear();

          if (componentType === 'configuration' && pluginDefinitionKey) {
            configurationComponent = pluginSpecifications.find(
              specification => specification.pluginId === pluginDefinitionKey
            )?.pluginConfigurationComponent;
          } else if (componentType === 'function' && pluginDefinitionKey && functionKey) {
            const pluginSpecification = pluginSpecifications.find(
              specification => specification.pluginId === pluginDefinitionKey
            );
            configurationComponent =
              pluginSpecification?.functionConfigurationComponents[functionKey];
          }

          if (configurationComponent) {
            const componentInstance = this.dynamicContainer.createComponent(configurationComponent);
            this.componentInstance$.next(componentInstance);
            this.noConfigurationComponentAvailable$.next(false);
          } else {
            this.noConfigurationComponentAvailable$.next(true);
          }
        })
      )
      .subscribe();
  }

  private openComponentInstanceSubscription(): void {
    this.componentInstanceSubscription = this.componentInstance$.subscribe(instance => {
      console.log('instance', instance);
    });
  }
}
