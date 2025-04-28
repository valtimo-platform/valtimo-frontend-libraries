import {Injectable} from '@angular/core';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CaseTag} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CaseTagService extends BaseApiService {
  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
  }

  public getCaseTagsManagement(
    caseDefinitionKey: string,
    caseDefinitionVersionTag: string
  ): Observable<CaseTag[]> {
    return this.httpClient.get<CaseTag[]>(
      this.getApiUrl(
        `/management/v1/case-definition/${caseDefinitionKey}/version/${caseDefinitionVersionTag}/case-tag`
      )
    );
  }

  public getCaseTags(
    caseDefinitionKey: string,
    caseDefinitionVersionTag: string
  ): Observable<CaseTag[]> {
    return this.httpClient.get<CaseTag[]>(
      this.getApiUrl(
        `/v1/case-definition/${caseDefinitionKey}/version/${caseDefinitionVersionTag}/case-tag`
      )
    );
  }

  public saveCaseTag(
    caseDefinitionKey: string,
    caseDefinitionVersionTag: string,
    tag: CaseTag
  ): Observable<CaseTag> {
    return this.httpClient.post<CaseTag>(
      this.getApiUrl(
        `/management/v1/case-definition/${caseDefinitionKey}/version/${caseDefinitionVersionTag}/case-tag`
      ),
      tag
    );
  }

  public updateCaseTag(
    caseDefinitionKey: string,
    caseDefinitionVersionTag: string,
    currentTag: string,
    updatedTag: CaseTag
  ): Observable<CaseTag> {
    return this.httpClient.put<CaseTag>(
      this.getApiUrl(
        `/management/v1/case-definition/${caseDefinitionKey}/version/${caseDefinitionVersionTag}/case-tag/${currentTag}`
      ),
      updatedTag
    );
  }

  public deleteCaseTag(
    caseDefinitionKey: string,
    caseDefinitionVersionTag: string,
    tag: string
  ): Observable<void> {
    return this.httpClient.delete<void>(
      this.getApiUrl(
        `/management/v1/case-definition/${caseDefinitionKey}/version/${caseDefinitionVersionTag}/case-tag/${tag}`
      )
    );
  }

  public updateCaseTags(
    caseDefinitionKey: string,
    caseDefinitionVersionTag: string,
    reorderedTags: CaseTag[]
  ): Observable<CaseTag[]> {
    return this.httpClient.put<CaseTag[]>(
      this.getApiUrl(
        `/management/v1/case-definition/${caseDefinitionKey}/version/${caseDefinitionVersionTag}/case-tag`
      ),
      reorderedTags
    );
  }
}
