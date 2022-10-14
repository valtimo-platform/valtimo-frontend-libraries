import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '@valtimo/config';
import {Observable} from 'rxjs';
import ExactRefreshToken from './exact-refresh-token';

@Injectable({
  providedIn: 'root',
})
export class ExactPluginService {
  private valtimoEndpointUri: string;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.valtimoEndpointUri = configService.config.valtimoApi.endpointUri;
  }

  exchangeAuthorizationCode(clientId: string, clientSecret: string, code: string): Observable<ExactRefreshToken> {
    return this.http.post<ExactRefreshToken>(`${this.valtimoEndpointUri}plugin/exact/exchange`, {
      clientId: clientId,
      clientSecret: clientSecret,
      code: code
    });
  }
}
