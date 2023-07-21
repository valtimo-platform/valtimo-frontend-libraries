import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AccessControlService} from '../../services/access-control.service';
import {BehaviorSubject, combineLatest, finalize, switchMap, take, tap} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {EditorModel, PageTitleService} from '@valtimo/components';
import {Role} from '../../models';

@Component({
  templateUrl: './access-control-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./access-control-editor.component.scss'],
})
export class AccessControlEditorComponent implements OnInit {
  public readonly model$ = new BehaviorSubject<EditorModel | null>(null);
  public readonly saveDisabled$ = new BehaviorSubject<boolean>(true);
  public readonly editorDisabled$ = new BehaviorSubject<boolean>(false);
  public readonly moreDisabled$ = new BehaviorSubject<boolean>(true);
  public readonly showDeleteModal$ = new BehaviorSubject<boolean>(false);
  public readonly showEditModal$ = new BehaviorSubject<boolean>(false);
  public readonly deleteRowKeys$ = new BehaviorSubject<Array<string> | null>(null);

  private readonly _updatedModelValue$ = new BehaviorSubject<string>('');

  constructor(
    private readonly accessControlService: AccessControlService,
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService,
    private readonly router: Router
  ) {}

  public ngOnInit(): void {
    this.getPermissions();
  }

  public onValid(valid: boolean): void {
    this.saveDisabled$.next(valid === false);
  }

  public onValueChange(value: string): void {
    this._updatedModelValue$.next(value);
  }

  public updatePermissions(): void {
    this.disableEditor();
    this.disableSave();
    this.disableMore();

    combineLatest([this.route.params, this._updatedModelValue$])
      .pipe(
        take(1),
        switchMap(([params, updatedModelValue]) =>
          this.accessControlService.updateRolePermissions(params.id, JSON.parse(updatedModelValue))
        )
      )
      .subscribe(
        result => {
          this.enableMore();
          this.enableSave();
          this.enableEditor();
          this.setModel(result);
        },
        () => {
          this.enableMore();
          this.enableSave();
          this.enableEditor();
        }
      );
  }

  public onDelete(roles: Array<string>): void {
    this.disableEditor();
    this.disableSave();
    this.disableMore();

    this.accessControlService.dispatchAction(
      this.accessControlService.deleteRoles({roles}).pipe(
        finalize(() => {
          this.router.navigate(['/access-control']);
        })
      )
    );
  }

  public showDeleteModal(): void {
    this.showDeleteModal$.next(true);
  }

  public showEditModal(): void {
    this.showEditModal$.next(true);
  }

  public onEdit(data: Role | null): void {
    this.showEditModal$.next(false);

    if (!data) {
      return;
    }

    this.disableEditor();
    this.disableSave();
    this.disableMore();

    this.accessControlService.dispatchAction(
      this.accessControlService.addRole(data).pipe(
        finalize(() => {
          this.showEditModal$.next(false);
          this.enableMore();
          this.enableSave();
          this.enableEditor();
          console.log('edit success', data);
        })
      )
    );
  }

  private getPermissions(): void {
    this.route.params
      .pipe(
        tap(params => {
          this.pageTitleService.setCustomPageTitle(params?.id);
          this.deleteRowKeys$.next([params?.id]);
        }),
        switchMap(params => this.accessControlService.getRolePermissions(params.id))
      )
      .subscribe(permissions => {
        this.enableMore();
        this.enableSave();
        this.setModel(permissions);
      });
  }

  private setModel(permissions: object): void {
    this.model$.next({
      value: JSON.stringify(permissions),
      language: 'json',
    });
  }

  private disableMore(): void {
    this.moreDisabled$.next(true);
  }

  private enableMore(): void {
    this.moreDisabled$.next(false);
  }

  private disableSave(): void {
    this.saveDisabled$.next(true);
  }

  private enableSave(): void {
    this.saveDisabled$.next(false);
  }

  private disableEditor(): void {
    this.editorDisabled$.next(true);
  }

  private enableEditor(): void {
    this.editorDisabled$.next(false);
  }
}
