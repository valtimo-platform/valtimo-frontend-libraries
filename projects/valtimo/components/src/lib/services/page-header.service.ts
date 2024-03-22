/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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

import {Injectable, ViewContainerRef} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ConfigService} from '@valtimo/config';

@Injectable({
  providedIn: 'root',
})
export class PageHeaderService {
  private readonly _headerViewContainerRef$ = new BehaviorSubject<ViewContainerRef | null>(null);
  private readonly _contentViewContainerRef$ = new BehaviorSubject<ViewContainerRef | null>(null);
  private readonly _compactMode$ = new BehaviorSubject<boolean>(
    !!this.configService?.config?.featureToggles?.compactModeOnByDefault
  );

  public get headerViewContainerRef$(): Observable<ViewContainerRef> {
    return this._headerViewContainerRef$.pipe(filter(ref => !!ref));
  }

  public get contentViewContainerRef$(): Observable<ViewContainerRef> {
    return this._contentViewContainerRef$.pipe(filter(ref => !!ref));
  }

  public get compactMode$(): Observable<boolean> {
    return this._compactMode$.asObservable();
  }

  constructor(private readonly configService: ConfigService) {}

  public setHeaderViewContainerRef(ref: ViewContainerRef): void {
    this._headerViewContainerRef$.next(ref);
  }

  public setContentViewContainerRef(ref: ViewContainerRef): void {
    this._contentViewContainerRef$.next(ref);
  }

  public setCompactMode(compactMode: boolean): void {
    this._compactMode$.next(compactMode);
  }
}
