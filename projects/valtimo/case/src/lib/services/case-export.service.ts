import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {combineLatest, first, of, switchMap, startWith, Observable} from 'rxjs';
import {CaseListService} from './case-list.service';
import {CaseParameterService} from './case-parameter.service';
import {CaseListSearchService} from './case-list-search.service';

@Injectable()
export class CaseExportService {
  constructor(
    private http: HttpClient,
    private readonly listService: CaseListService,
    private readonly parameterService: CaseParameterService,
    private readonly caseListSearchService: CaseListSearchService
  ) {}

  downloadExport(): Observable<{isLoading: boolean}> {
    return combineLatest([
      this.listService.caseDefinitionKey$,
      this.parameterService.querySearchParams$,
      this.parameterService.queryAssigneeParam$,
      this.parameterService.queryStatusParams$,
      this.parameterService.queryCaseTagsParams$,
    ]).pipe(
      first(),
      switchMap(data => {
        const body = {
          documentDefinitionName: data[0],
          searchOperator: 'AND',
          assigneeFilter: data[2],
          statusFilter: data[3],
          caseTagsFilter: data[4],
          otherFilters: this.caseListSearchService.mapSearchValuesToFilters(data[1]),
        };
        return this.http.post(
          `/api/v1/case/${data[0]}/export?definitionName=${data[0]}&page=0&size=10&sort=createdOn%2CDESC`,
          body,
          {responseType: 'blob', observe: 'response'}
        );
      }),
      switchMap(data => {
        const contentDisposition = data.headers.get('Content-Disposition');
        let filename = 'export.csv';
        if (contentDisposition) {
          const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1];
          }
        }
        const url = URL.createObjectURL(data.body as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = filename;
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return of({isLoading: false});
      }),
      startWith({isLoading: true})
    );
  }
}
