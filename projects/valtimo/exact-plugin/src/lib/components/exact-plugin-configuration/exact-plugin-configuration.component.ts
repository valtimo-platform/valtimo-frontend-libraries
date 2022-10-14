import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {PluginConfigurationComponent} from '@valtimo/plugin';
import {BehaviorSubject, combineLatest, interval, Observable, Subject, Subscription, take, tap, timer} from 'rxjs';
import {ExactPluginService} from '../../exact-plugin.service';
import {ExactPluginConfig} from '../../exact-plugin';

@Component({
  selector: 'app-exact-plugin-configuration',
  templateUrl: './exact-plugin-configuration.component.html',
  //styleUrls: ['./sample-plugin-configuration.component.scss'],
})
export class ExactPluginConfigurationComponent
  // The component explicitly implements the PluginConfigurationComponent interface
  implements PluginConfigurationComponent, OnInit, OnDestroy {
  @Input() save$: Observable<void>;
  @Input() disabled$: Observable<boolean>;
  @Input() pluginId: string;
  @Input() prefillConfiguration$: Observable<ExactPluginConfig>;
  @Output() valid: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() configuration: EventEmitter<ExactPluginConfig> =
    new EventEmitter<ExactPluginConfig>();

  private saveSubscription!: Subscription;
  private readonly formValue$ = new BehaviorSubject<ExactPluginConfig | null>(null);
  private readonly valid$ = new BehaviorSubject<boolean>(false);
  private storageCallbackFun!: any;

  constructor(private exactPluginService: ExactPluginService) { }

  ngOnInit(): void {
    this.openSaveSubscription();
    this.storageCallbackFun = this.onReceiveToken.bind(this);
    window.addEventListener('storage', this.storageCallbackFun);
  }

  onReceiveToken(event) {
    if (event.key === 'exactAuthorizationCode') {
      this.formValue$.pipe(take(1)).subscribe((formValue) => {
        this.exchangeAuthorizationCode(formValue, localStorage.getItem('exactAuthorizationCode'));
      }).unsubscribe();
    }
  }

  ngOnDestroy() {
    this.saveSubscription?.unsubscribe();
    window.removeEventListener('storage', this.storageCallbackFun);
  }

  exchangeAuthorizationCode(formValue, code) {
    this.exactPluginService
      .exchangeAuthorizationCode(formValue.clientId, formValue.clientSecret, code)
      .subscribe((response) => {
        formValue.accessToken = response.accessToken;
        formValue.accessTokenExpiresOn = response.accessTokenExpiresOn;
        formValue.refreshToken = response.refreshToken;
        formValue.refreshTokenExpiresOn = response.refreshTokenExpiresOn;
        this.formValueChange(formValue);
      });
  }

  formValueChange(formValue: ExactPluginConfig): void {
    this.formValue$.next(formValue);
    this.handleValid(formValue);
  }

  openAuthenticationWindow(): void {
    this.formValue$.subscribe((formValue: ExactPluginConfig) => {
      const redirect_url = window.location.origin + '/plugins/exact/redirect';
      window.open(`https://start.exactonline.nl/api/oauth2/auth?client_id=${formValue.clientId}&redirect_uri=${redirect_url}&response_type=code&force_login=0`, '_blank');
    }).unsubscribe();
  }

  private handleValid(formValue: ExactPluginConfig): void {
    const valid = !!(formValue.clientId && formValue.clientSecret && formValue.accessToken && formValue.refreshToken);

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
