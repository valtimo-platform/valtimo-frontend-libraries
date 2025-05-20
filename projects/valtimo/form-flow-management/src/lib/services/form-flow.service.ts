import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigService, Page} from '@valtimo/shared';
import {BehaviorSubject, catchError, Observable, of, switchMap, take, tap} from 'rxjs';
import {FormFlowDefinition, FormFlowDefinitionId, ListFormFlowDefinition} from '../models';

@Injectable({
  providedIn: 'root',
})
export class FormFlowService extends BaseApiService {
  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
  }

  public getFormFlowDefinitions(
    caseDefinitionKey: string,
    caseVersionTag: string
  ): Observable<Page<ListFormFlowDefinition>> {
    return this.httpClient.get<Page<ListFormFlowDefinition>>(
      this.getApiUrl(
        `management/v1/case-definition/${caseDefinitionKey}/version/${caseVersionTag}/form-flow-definition`
      )
    );
  }

  public getFormFlowDefinitionByKey(
    caseDefinitionKey: string,
    caseVersionTag: string,
    formFlowDefinitionKey: string
  ): Observable<FormFlowDefinition> {
    return this.httpClient.get<FormFlowDefinition>(
      this.getApiUrl(
        `management/v1/case-definition/${caseDefinitionKey}/version/${caseVersionTag}/form-flow-definition/${formFlowDefinitionKey}`
      )
    );
  }

  public createFormFlowDefinition(
    caseDefinitionKey: string,
    caseVersionTag: string,
    definition: FormFlowDefinition
  ): Observable<FormFlowDefinition> {
    return this.httpClient.post<FormFlowDefinition>(
      this.getApiUrl(
        `management/v1/case-definition/${caseDefinitionKey}/version/${caseVersionTag}/form-flow-definition`
      ),
      definition
    );
  }

  public deleteFormFlowDefinition(
    caseDefinitionKey: string,
    caseVersionTag: string,
    definitionKey: string
  ): Observable<null> {
    return this.httpClient.delete<null>(
      this.getApiUrl(
        `management/v1/case-definition/${caseDefinitionKey}/version/${caseVersionTag}/form-flow-definition/${definitionKey}`
      )
    );
  }

  public updateFormFlowDefinition(
    caseDefinitionKey: string,
    caseVersionTag: string,
    definitionKey: string,
    updatedDefinition: FormFlowDefinition
  ): Observable<FormFlowDefinition> {
    return this.httpClient.put<FormFlowDefinition>(
      this.getApiUrl(
        `management/v1/case-definition/${caseDefinitionKey}/version/${caseVersionTag}/form-flow-definition/${definitionKey}`
      ),
      updatedDefinition
    );
  }
}
