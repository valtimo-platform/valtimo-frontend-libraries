import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription, take} from 'rxjs';
import {FunctionConfigurationComponent} from '@valtimo/plugin';
import ExactGetRequestConfiguration from './exact-get-request-configuration';

@Component({
  selector: 'app-exact-get-request-configuration',
  templateUrl: './exact-get-request-configuration.component.html'
})
export class ExactGetRequestConfigurationComponent
  // The component explicitly implements the PluginConfigurationComponent interface
  implements FunctionConfigurationComponent, OnInit, OnDestroy {
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Input() prefillConfiguration$: Observable<ExactGetRequestConfiguration>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<ExactGetRequestConfiguration> =
    new EventEmitter<ExactGetRequestConfiguration>();

  private saveSubscription!: Subscription;

  private readonly formValue$ = new BehaviorSubject<ExactGetRequestConfiguration | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);

  formValues: any = null;

  ngOnInit(): void {
    this.openSaveSubscription();
  }

  ngOnDestroy() {
    this.saveSubscription?.unsubscribe();
  }

  formValueChange(input: any): void {
    let formValue: ExactGetRequestConfiguration = {
      properties: {
        uri: input.uri,
        bean: input.bean
      }
    }

    this.formValue$.next(formValue);
    this.handleValid(formValue);
  }

  private handleValid(formValue: ExactGetRequestConfiguration): void {
    const valid = !!(formValue.properties.uri || formValue.properties.bean);

    this.valid$.next(valid);
    this.valid.emit(valid);
  }

  private openSaveSubscription(): void {
    this.saveSubscription = this.save$?.subscribe(save => {
      combineLatest([this.formValue$, this.valid$])
        .pipe(take(1))
        .subscribe(([formValue, valid]) => {
          if (valid) {
            this.configuration.emit(formValue);
          }
        });
    });
  }
}
