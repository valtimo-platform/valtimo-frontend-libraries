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

  public getObjectsByObjectManagementId(objectManagementId: string, params?: any): Observable<ObjectConfiguration> {
    return this.http.get<ObjectConfiguration>(`${this.valtimoEndpointUri}v1/object/management/configuration/${objectManagementId}/object`, {params});
  }

  public createObject(params: {objectManagementId: string}, payload: object): Observable<any> {
    return this.http.post<any>(`${this.valtimoEndpointUri}v1/object`, payload, {params});
  }

  public updateObject(params: {objectManagementId: string, objectId: string}, payload: object): Observable<any> {
    return this.http.patch<any>(`${this.valtimoEndpointUri}v1/object`, payload, {params});
  }

  public deleteObject(params: {objectManagementId: string, objectId: string}): Observable<any> {
    return this.http.delete<any>(`${this.valtimoEndpointUri}v1/object`, {params});
  }

  public getPrefilledObjectFromObjectUrl(params: any): Observable<FormDefinition> {
    return this.http.get<FormDefinition>(`${this.valtimoEndpointUri}v1/object/form`, {params});
  }

  public removeEmptyStringValuesFromSubmission(submission) {
    return Object.fromEntries(
      Object.entries(submission).filter(([_, value]) => value !== '')
    );
  };
}
