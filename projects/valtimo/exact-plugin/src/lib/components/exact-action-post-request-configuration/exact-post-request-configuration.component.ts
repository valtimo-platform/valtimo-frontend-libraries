import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription, take} from 'rxjs';
import {FunctionConfigurationComponent} from '@valtimo/plugin';
import ExactPostRequestConfiguration from './exact-post-request-configuration';
import ExactGetRequestConfiguration from '../exact-action-get-request-configuration/exact-get-request-configuration';

@Component({
  selector: 'app-exact-post-request-configuration',
  templateUrl: './exact-post-request-configuration.component.html'
})
export class ExactPostRequestConfigurationComponent
  // The component explicitly implements the PluginConfigurationComponent interface
  implements FunctionConfigurationComponent, OnInit, OnDestroy {
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Input() prefillConfiguration$: Observable<ExactPostRequestConfiguration>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<ExactPostRequestConfiguration> =
    new EventEmitter<ExactPostRequestConfiguration>();

  private saveSubscription!: Subscription;

  private readonly formValue$ = new BehaviorSubject<ExactPostRequestConfiguration | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);

  formValues: any = null;

  ngOnInit(): void {
    this.openSaveSubscription();
  }

  ngOnDestroy() {
    this.saveSubscription?.unsubscribe();
  }

  formValueChange(input: any): void {
    let formValue: ExactPostRequestConfiguration = {
      properties: {
        uri: input.uri,
        content: input.content,
        bean: input.bean
      }
    }

    this.formValue$.next(formValue);
    this.handleValid(formValue);
  }

  private handleValid(formValue: ExactPostRequestConfiguration): void {
    const valid = !!(formValue.properties.uri && formValue.properties.content || formValue.properties.bean);

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
