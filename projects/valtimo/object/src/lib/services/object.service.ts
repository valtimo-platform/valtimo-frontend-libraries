import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from '@valtimo/config';
import {ObjectConfiguration} from '../models/object.model';
import {FormDefinition} from '@valtimo/form-management';

@Injectable({
  providedIn: 'root'
})
export class ObjectService {

  private readonly valtimoEndpointUri: string;

  constructor(private http: HttpClient, configService: ConfigService) {
    this.valtimoEndpointUri = configService.config.valtimoApi.endpointUri;
  }

  public getObjectsByConfigurationId(configurationId: string, params?: any): Observable<ObjectConfiguration> {
    return this.http.get<ObjectConfiguration>(`${this.valtimoEndpointUri}v1/object/management/configuration/${configurationId}/object`, {params});
  }

  public getPrefilledObjectFromObjectUrl(params: any): Observable<FormDefinition> {
    return this.http.get<FormDefinition>(`${this.valtimoEndpointUri}v1/object/form`, {params});
  }
}
