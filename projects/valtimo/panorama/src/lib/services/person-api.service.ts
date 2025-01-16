import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {Observable} from 'rxjs';
import {Person} from '../models';

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

  public getPersonDetails(bsn: string | null): Observable<Person | null> {
    return this.httpClient.get<Person>(`/api/v1/profile/${bsn}/persoon`, {
      headers: {
        'X-API-KEY': '49*HwbhRvxf!6vt7GnXj8xpmmZ87m9sK',
      },
    });
  }
}
