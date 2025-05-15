import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BaseApiService, ConfigService, Page} from '@valtimo/config';
import {Observable} from 'rxjs';
import {ListFormFlowDefinition} from '../models';

@Injectable({
  providedIn: 'root',
})
export class FormFlowService2 extends BaseApiService {
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
        `v1/case-definition/${caseDefinitionKey}/version/${caseVersionTag}/form-flow-definition`
      )
    );
  }
}
