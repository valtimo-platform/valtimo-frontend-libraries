import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AccessControlService} from '../../services/access-control.service';
import {BehaviorSubject, switchMap, take, tap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {EditorModel, PageTitleService} from '@valtimo/components';

@Component({
  templateUrl: './access-control-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessControlEditorComponent implements OnInit {
  public readonly model$ = new BehaviorSubject<EditorModel | null>(null);

  constructor(
    private readonly accessControlService: AccessControlService,
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService
  ) {}

  public ngOnInit(): void {
    this.getPermissions();
  }

  private getPermissions(): void {
    this.route.params
      .pipe(
        take(1),
        tap(params => {
          this.pageTitleService.setCustomPageTitle(params?.id);
        }),
        switchMap(params => this.accessControlService.getRolePermissions(params.id))
      )
      .subscribe(permissions => {
        this.model$.next({
          value: JSON.stringify(permissions),
          language: 'json',
        });
      });
  }
}
