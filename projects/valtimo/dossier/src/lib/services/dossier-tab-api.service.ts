import {Injectable} from '@angular/core';
import {ConfigService, Page} from '@valtimo/config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Note} from '../models/notes.model';

@Injectable({
  providedIn: 'root',
})
export class DossierTabApiService {
  private readonly VALTIMO_API_ENDPOINT_URI = this.configService.config.valtimoApi.endpointUri;

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpClient
  ) {}

  public getDossierTabs(documentDefinitionName): Observable<any> {
    return this.http.get<any>(
      `${this.VALTIMO_API_ENDPOINT_URI}v1/case-definition/${documentDefinitionName}/tab`
    );
  }
}
