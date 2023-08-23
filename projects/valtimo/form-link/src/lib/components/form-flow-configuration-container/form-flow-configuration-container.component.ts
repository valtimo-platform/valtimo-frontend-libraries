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
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ConfigurationOutput} from '../../models';
import {FormFlowService} from '../../services';

@Component({
  selector: 'valtimo-form-flow-configuration-container',
  templateUrl: './form-flow-configuration-container.component.html',
})
export class FormFlowConfigurationContainerComponent implements OnInit, OnDestroy {
  @ViewChild('formFlowConfigurationComponent', {static: true, read: ViewContainerRef})
  private readonly _dynamicContainer: ViewContainerRef;
  @Input() public set disabled(disabledValue: boolean) {
    this._disabled$.next(disabledValue);
  }
  @Input() public set id(value: string) {
    this._id$.next(value);
  }
  @Output() public configurationEvent = new EventEmitter<ConfigurationOutput>();

  private _configurationSubscription!: Subscription;
  private readonly _subscriptions = new Subscription();

  private readonly _componentRef$ = new BehaviorSubject<ComponentRef<Component> | undefined>(
    undefined
  );
  private readonly _disabled$ = new BehaviorSubject<boolean>(false);
  private readonly _id$ = new BehaviorSubject<string>('');

  constructor(private readonly formFlowService: FormFlowService) {}

  public ngOnInit(): void {
    this.openConfigurationComponentSubscription();
    this.openComponentInstanceSubscription();
    this.openDisabledSubscription();
  }

  public ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  private openConfigurationComponentSubscription(): void {
    this._subscriptions.add(
      combineLatest([this._id$, this.formFlowService.supportedComponents$])
        .pipe(
          tap(([id, supportedComponents]) => {
            const configurationComponent = supportedComponents.find(
              component => component.id === id
            );

            this._dynamicContainer.clear();

            if (configurationComponent) {
              const componentRef = this._dynamicContainer.createComponent(
                configurationComponent.component
              );
              this.configurationEvent.emit({valid: false, data: {}});
              this._componentRef$.next(componentRef);
            } else {
              this.configurationEvent.emit({valid: true, data: {}});
            }
          })
        )
        .subscribe()
    );
  }

  private openComponentInstanceSubscription(): void {
    this._subscriptions.add(
      combineLatest([this._componentRef$, this._id$]).subscribe(([ref, id]) => {
        const instance = ref?.instance;

        this._configurationSubscription?.unsubscribe();

        if (instance) {
          if (id) {
            (instance as any).id = id;
          }

          this._configurationSubscription = (instance as any).configurationEvent.subscribe(
            configuration => {
              this.configurationEvent.emit(configuration);
            }
          );
        }
      })
    );
  }

  private openDisabledSubscription(): void {
    this._subscriptions.add(
      combineLatest([this._componentRef$, this._disabled$]).subscribe(([ref, disabled]) => {
        const instance = ref?.instance;

        if (instance) {
          (instance as any).disabled = disabled;
        }
      })
    );
  }

  private openPrefillConfigurationSubscription(): void {
    this._subscriptions.add(
      combineLatest([this._componentRef$, this._prefillConfiguration$]).subscribe(
        ([ref, prefillConfiguration]) => {
          const instance = ref?.instance;

          if (instance && prefillConfiguration) {
            instance.prefillConfiguration = prefillConfiguration;
          }
        }
      )
    );
  }
}
