import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigService, Page, BaseApiService} from '@valtimo/config';
import {Observable} from 'rxjs';
import {LoggingEvent, LoggingEventSearchRequest} from '../models';

@Injectable({
  providedIn: 'root',
})
export class LoggingApiService extends BaseApiService {
  constructor(
    protected readonly configService: ConfigService,
    protected readonly httpClient: HttpClient
  ) {
    super(httpClient, configService);
  }

  public getTechnicalLogs(
    searchRequest: LoggingEventSearchRequest
  ): Observable<Page<LoggingEvent>> {
    const {size, page, ...searchBody} = searchRequest;
    const params = new HttpParams({
      fromObject: {size, page} as any,
    });

    return this.httpClient.post<Page<LoggingEvent>>(
      this.getApiUrl('management/v1/logging'),
      {searchBody},
      {
        params,
      }
    );
  }
}
