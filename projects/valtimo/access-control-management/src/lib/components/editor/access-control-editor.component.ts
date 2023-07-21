import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AccessControlService} from '../../services/access-control.service';
import {BehaviorSubject, combineLatest, switchMap, take, tap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {EditorModel, PageTitleService} from '@valtimo/components';

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

  private readonly _updatedModelValue$ = new BehaviorSubject<string>('');

  constructor(
    private readonly accessControlService: AccessControlService,
    private readonly route: ActivatedRoute,
    private readonly pageTitleService: PageTitleService
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

  private getPermissions(): void {
    this.route.params
      .pipe(
        tap(params => {
          this.pageTitleService.setCustomPageTitle(params?.id);
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
