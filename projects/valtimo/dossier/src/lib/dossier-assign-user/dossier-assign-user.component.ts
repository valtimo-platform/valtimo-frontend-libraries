/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {DropdownItem} from '@valtimo/components';
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs';
import {take, tap} from 'rxjs/operators';
import {User} from '@valtimo/config';
import {DocumentService} from '@valtimo/document';

@Component({
  selector: 'valtimo-dossier-assign-user',
  templateUrl: './dossier-assign-user.component.html',
  styleUrls: ['./dossier-assign-user.component.css'],
})
export class DossierAssignUserComponent implements OnInit, OnChanges, OnDestroy {
  @Input() documentId: string;
  @Input() assigneeId: string;
  @Input() assigneeFullName: string;
  @Output() assignmentOfDocumentChanged = new EventEmitter();

  candidateUsersForDocument$ = new BehaviorSubject<User[]>(undefined);
  disabled$ = new BehaviorSubject<boolean>(true);
  assignedIdOnServer$ = new BehaviorSubject<string>(null);
  userIdToAssign: string = null;
  assignedUserFullName$ = new BehaviorSubject<string>(null);
  private _subscriptions = new Subscription();

  constructor(private readonly documentService: DocumentService) {
  }

  ngOnInit(): void {
    this._subscriptions.add(
      this.documentService.getCandidateUsers(this.documentId).subscribe(candidateUsers => {
        this.candidateUsersForDocument$.next(candidateUsers);
        if (this.assigneeId) {
          this.assignedIdOnServer$.next(this.assigneeId);
          this.userIdToAssign = this.assigneeId;
          this.assignedUserFullName$.next(this.assigneeFullName);
        }
        this.enable();
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    const assigneeId = changes.assigneeId;
    if (assigneeId) {
      this.candidateUsersForDocument$.pipe(take(1)).subscribe(candidateUsers => {
        const currentUserEmail = assigneeId.currentValue;
        this.assignedIdOnServer$.next(currentUserEmail || null);
        this.userIdToAssign = currentUserEmail || null;
        this.assignedUserFullName$.next(this.assigneeFullName);
      });
    } else {
      this.clear();
    }
  }

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  assignDocument(userId: string): void {
    this.disable();
    combineLatest([
      this.candidateUsersForDocument$,
      this.documentService.assignHandlerToDocument(this.documentId, userId),
    ])
      .pipe(
        take(1),
        tap(([candidateUsers]) => {
          this.userIdToAssign = userId;
          this.assignedIdOnServer$.next(userId);
          this.assignedUserFullName$.next(this.assigneeFullName);
          this.emitChange();
          this.enable();
        })
      )
      .subscribe();
  }

  unassignDocument(): void {
    this.disable();
    this.documentService
      .unassignHandlerFromDocument(this.documentId)
      .pipe(
        tap(() => {
          this.clear();
          this.emitChange();
          this.enable();
        })
      )
      .subscribe();
  }

  getAssignedUserName(users: User[], userId: string): string {
    if (users && userId) {
      const findUser = users.find(user => user.id === userId);

      return findUser ? findUser.fullName : '';
    }
    return '';
  }

  mapUsersForDropdown(users: User[]): DropdownItem[] {
    return (
      users &&
      users
        .filter(
          (user, index, users) => index === users.findIndex(findUser => findUser.id === user.id)
        )
        .map(user => ({text: `${user.firstName} ${user.lastName}`, id: user.id}))
    );
  }

  private clear(): void {
    this.assignedIdOnServer$.next(null);
    this.userIdToAssign = null;
  }

  private emitChange(): void {
    this.assignmentOfDocumentChanged.emit();
  }

  private enable(): void {
    this.disabled$.next(false);
  }

  private disable(): void {
    this.disabled$.next(true);
  }
}
