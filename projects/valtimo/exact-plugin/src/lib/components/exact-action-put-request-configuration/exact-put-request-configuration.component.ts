import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription, take} from 'rxjs';
import {FunctionConfigurationComponent} from '@valtimo/plugin';
import ExactPutRequestConfiguration from './exact-put-request-configuration';
import ExactPostRequestConfiguration from '../exact-action-post-request-configuration/exact-post-request-configuration';

@Component({
  selector: 'app-exact-put-request-configuration',
  templateUrl: './exact-put-request-configuration.component.html'
})
export class ExactPutRequestConfigurationComponent
  // The component explicitly implements the PluginConfigurationComponent interface
  implements FunctionConfigurationComponent, OnInit, OnDestroy {
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Input() prefillConfiguration$: Observable<ExactPutRequestConfiguration>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<ExactPutRequestConfiguration> =
    new EventEmitter<ExactPutRequestConfiguration>();

  private saveSubscription!: Subscription;

  private readonly formValue$ = new BehaviorSubject<ExactPutRequestConfiguration | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);

  formValues: any = null;

  ngOnInit(): void {
    this.openSaveSubscription();
  }

  ngOnDestroy() {
    this.saveSubscription?.unsubscribe();
  }

  formValueChange(input: any): void {
    let formValue: ExactPutRequestConfiguration = {
      properties: {
        uri: input.uri,
        content: input.content,
        bean: input.bean
      }
    }

    this.formValue$.next(formValue);
    this.handleValid(formValue);
  }

  private handleValid(formValue: ExactPutRequestConfiguration): void {
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
