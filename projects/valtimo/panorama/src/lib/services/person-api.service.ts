import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PersonApiService extends BaseApiService {
  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
  }

  public getPersonDetails(bsn: string): Observable<any> {
    return this.httpClient.get(`http://localhost:8085/api/v1/profile/${bsn}/persoon`, {
      headers: {
        'X-API-KEY': '49*HwbhRvxf!6vt7GnXj8xpmmZ87m9sK',
      },
    });
  }
}
