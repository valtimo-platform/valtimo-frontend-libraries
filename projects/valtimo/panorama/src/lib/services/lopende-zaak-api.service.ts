import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, filter} from 'rxjs';
import {LopendeZaak, Person} from '../models';
import {lopendeZaken} from '../mocks';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LopendeZaakApiService extends BaseApiService {
  private readonly _lopendeZaaken$ = new BehaviorSubject<LopendeZaak[]>(lopendeZaken.results);
  public readonly lopendeZaaken$ = this._lopendeZaaken$.pipe(
    filter((lopendeZaaken: LopendeZaak[]) => lopendeZaaken.length > 0)
  );

  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
  }

  public lopendeZakenOpen(zaken: LopendeZaak[]): void {
    this._lopendeZaaken$.next(zaken);
  }

  public getLopendeZaken(bsn: string | null): Observable<{results: LopendeZaak[]}> {
    return this.httpClient.get<{results: LopendeZaak[]}>(`/api/v1/profile/${bsn}/lopende-zaken`, {
      headers: {
        'X-API-KEY': '49*HwbhRvxf!6vt7GnXj8xpmmZ87m9sK',
      },
    });
  }
}
