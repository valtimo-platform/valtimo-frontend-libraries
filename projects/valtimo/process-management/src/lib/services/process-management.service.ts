import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BaseApiService, ConfigService} from '@valtimo/config';
import {BehaviorSubject, combineLatest, filter, Observable, switchMap} from 'rxjs';

import {CaseProcessInstance} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ProcessManagementService extends BaseApiService {
  private readonly _caseDefinitionName$ = new BehaviorSubject<string | null>(null);
  private readonly _caseVersionTag$ = new BehaviorSubject<string | null>(null);

  public processes$: Observable<CaseProcessInstance[]> = combineLatest([
    this._caseDefinitionName$,
    this._caseVersionTag$,
  ]).pipe(
    filter(([caseDefinitionName, caseVersionTag]) => !!caseDefinitionName && !!caseVersionTag),
    switchMap(([caseDefinitionName, caseVersionTag]) =>
      this.getProcesses(caseDefinitionName ?? '', caseVersionTag ?? '')
    )
  );

  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService
  ) {
    super(httpClient, configService);
  }

  public setParams(caseDefinitionName: string, caseVersionTag: string): void {
    this._caseDefinitionName$.next(caseDefinitionName);
    this._caseVersionTag$.next(caseVersionTag);
  }

  public deleteProcess(processDefinitionId: string): Observable<void> {
    return this.httpClient.delete<void>(
      this.getApiUrl(
        `/management/v1/case-definition/${this._caseDefinitionName$.getValue()}/version/${this._caseVersionTag$.getValue()}/process-definition/${processDefinitionId}`
      )
    );
  }

  public deployBpmn(bpmn: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', bpmn);
    formData.append(
      'processLinks',
      new Blob([JSON.stringify([].map(processLink => this.emptyStringToNull(processLink)))], {
        type: 'application/json',
      })
    );

    return this.httpClient.post<any>(
      this.getApiUrl(
        `/management/v1/case-definition/${this._caseDefinitionName$.getValue()}/version/${this._caseVersionTag$.getValue()}/process-definition`
      ),
      formData
    );
  }

  private getProcesses(
    caseDefinitionName: string,
    caseVersionTag: string
  ): Observable<CaseProcessInstance[]> {
    return this.httpClient.get<CaseProcessInstance[]>(
      this.getApiUrl(
        `/management/v1/case-definition/${caseDefinitionName}/version/${caseVersionTag}/process-definition`
      )
    );
  }

  private emptyStringToNull<T extends Record<string, any>>(object: T): T {
    if (object && typeof object === 'object') {
      Object.keys(object).forEach(key => {
        const typedKey = key as keyof T;
        const value = object[typedKey];
        if (typeof value === 'object' && value !== null) {
          this.emptyStringToNull(value);
        } else if (value === '') {
          object[typedKey] = null as any;
        }
      });
    }
    return object;
  }
}
