import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '@valtimo/config';
import {ObjectConfiguration} from '../models/object.model';

@Injectable({
  providedIn: 'root'
})
export class ObjectService {

  private readonly valtimoEndpointUri: string;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.valtimoEndpointUri = configService.config.valtimoApi.endpointUri;
  }

  public getObjectsByConfigurationId(configurationId: string): Observable<ObjectConfiguration[]> {
    return this.http.get<ObjectConfiguration[]>(`${this.valtimoEndpointUri}v1/object/management/configuration/${configurationId}/object`);
  }
}
