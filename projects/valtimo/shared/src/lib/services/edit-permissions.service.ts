import {BaseApiService} from './base-api.service';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from './config.service';
import {combineLatest, map, Observable} from 'rxjs';
import {EnvironmentService} from './environment.service';
import {DraftVersionService} from './draft-version.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EditPermissionsService extends BaseApiService {
  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly configService: ConfigService,
    public readonly environmentService: EnvironmentService,
    public readonly draftVersionService: DraftVersionService
  ) {
    super(httpClient, configService);
  }

  public hasEditPermissions(
    caseDefinitionKey: string,
    caseDefinitionVersionTag: string
  ): Observable<boolean> {
    return combineLatest([
      this.environmentService.canUpdateGlobalConfiguration(),
      this.draftVersionService.isDraftVersion(caseDefinitionKey, caseDefinitionVersionTag),
    ]).pipe(map(([canUpdate, isDraftVersion]) => canUpdate && isDraftVersion));
  }
}
