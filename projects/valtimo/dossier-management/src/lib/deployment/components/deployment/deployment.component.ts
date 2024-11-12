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

import {Component, Inject, OnDestroy, OnInit, Renderer2, RendererStyleFlags2} from '@angular/core';
import {
  ButtonModule,
  IconModule,
  IconService,
  LayerModule,
  ProgressBarModule,
  TabsModule,
  TagModule,
  TileSelection,
  TilesModule,
} from 'carbon-components-angular';
import {CommonModule, DOCUMENT} from '@angular/common';
import {
  FitPageDirectiveModule,
  PageHeaderService,
  RenderInPageHeaderDirectiveModule,
} from '@valtimo/components';
import {BehaviorSubject, combineLatest, map, Observable, take, tap} from 'rxjs';
import {ArrowRight24, Deploy16} from '@carbon/icons';
import {LEFT_ARTIFACTS, RIGHT_ARTIFACTS} from './deployment.constants';
import {TranslateModule} from '@ngx-translate/core';

interface Artifact {
  caseDefinitionId: string;
  caseDefinitionTitle: string;
  version: string;
  date: Date;
  id?: string;
  disabled?: boolean;
}

@Component({
  standalone: true,
  templateUrl: './deployment.component.html',
  styleUrl: 'deployment.component.scss',
  imports: [
    CommonModule,
    LayerModule,
    TilesModule,
    FitPageDirectiveModule,
    FitPageDirectiveModule,
    TabsModule,
    IconModule,
    TagModule,
    RenderInPageHeaderDirectiveModule,
    ButtonModule,
    TranslateModule,
    ProgressBarModule,
  ],
})
export class DeploymentComponent implements OnInit, OnDestroy {
  public readonly activeTab$ = new BehaviorSubject<string>('');

  public readonly deploying$ = new BehaviorSubject<boolean>(false);

  private readonly _rightArtifacts$ = new BehaviorSubject<Artifact[]>(RIGHT_ARTIFACTS);

  public readonly rightArtifacts$ = combineLatest([this.activeTab$, this._rightArtifacts$]).pipe(
    map(([activeTab, rightArtifacts]) =>
      rightArtifacts
        .filter(artifact => artifact?.caseDefinitionId === activeTab)
        .map(artifact => ({...artifact, id: this.getArtifactId(artifact)}))
        .sort((a, b) => b.version.localeCompare(a.version))
    )
  );

  private readonly _leftArtifacts$ = new BehaviorSubject<Artifact[]>(LEFT_ARTIFACTS);

  public readonly leftArtifacts$ = combineLatest([
    this.activeTab$,
    this._leftArtifacts$,
    this.rightArtifacts$,
    this.deploying$,
  ]).pipe(
    map(([activeTab, leftArtifacts, rightArtifacts, deploying]) =>
      leftArtifacts
        .filter(artifact => artifact?.caseDefinitionId === activeTab)
        .map(artifact => ({...artifact, id: this.getArtifactId(artifact)}))
        .map(artifact => ({
          ...artifact,
          disabled:
            !!rightArtifacts.find(rightArtifact => rightArtifact.id === artifact.id) || deploying,
        }))
        .sort((a, b) => b.version.localeCompare(a.version))
    )
  );

  public readonly tabs$: Observable<{caseDefinitionId: string; caseDefinitionTitle: string}[]> =
    combineLatest([this._leftArtifacts$, this._rightArtifacts$]).pipe(
      map(([leftArtifacts, rightArtifacts]) =>
        this.getUniqueArtifacts([...leftArtifacts, ...rightArtifacts])
      ),
      tap(tabs => {
        const currentActiveTab = this.activeTab$.getValue();

        if (currentActiveTab) return;

        console.log('set active tab', tabs);

        this.activeTab$.next(tabs[0].caseDefinitionId);
      })
    );

  public readonly selectedTileIds$ = new BehaviorSubject<string[]>([]);

  public readonly amountOfSelectedTileIds$ = this.selectedTileIds$.pipe(
    map(selectedTileIds => selectedTileIds.length)
  );

  public readonly deployEnabled$ = this.selectedTileIds$.pipe(
    map(selectedTileIds => selectedTileIds.length > 0)
  );

  public readonly compactMode$ = this.pageHeaderService.compactMode$;

  constructor(
    private readonly iconService: IconService,
    private readonly pageHeaderService: PageHeaderService,
    @Inject(DOCUMENT) private document: Document,
    private readonly renderer: Renderer2
  ) {
    this.iconService.registerAll([ArrowRight24, Deploy16]);
  }

  public ngOnInit(): void {
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden', RendererStyleFlags2.Important);
    this.renderer.setStyle(
      this.document.documentElement,
      'overflow',
      'hidden',
      RendererStyleFlags2.Important
    );
  }

  public ngOnDestroy(): void {
    this.renderer.removeStyle(this.document.body, 'overflow');
    this.renderer.removeStyle(this.document.documentElement, 'overflow');
  }

  public changeTab(caseDefinitionId: string): void {
    console.log('change tab', caseDefinitionId);
    this.activeTab$.next(caseDefinitionId);
    this.selectedTileIds$.next([]);
  }

  public tileSelected(event: TileSelection): void {
    if (event.selected) {
      this.selectedTileIds$.next([...this.selectedTileIds$.getValue(), event.value]);
    } else {
      this.selectedTileIds$.next(
        this.selectedTileIds$.getValue().filter(value => value !== event.value)
      );
    }
  }

  public deploy(): void {
    combineLatest([this._leftArtifacts$, this._rightArtifacts$, this.selectedTileIds$])
      .pipe(take(1))
      .subscribe(([leftArtifacts, rightArtifacts, selectedTileIds]) => {
        this.deploying$.next(true);

        setTimeout(() => {
          this._rightArtifacts$.next([
            ...rightArtifacts,
            ...selectedTileIds.map(selectedTileId =>
              leftArtifacts.find(
                leftArtifact => this.getArtifactId(leftArtifact) === selectedTileId
              )
            ),
          ]);
          this.selectedTileIds$.next([]);
          this.deploying$.next(false);
        }, 2000);
      });
  }

  private getUniqueArtifacts(
    artifacts: Artifact[]
  ): {caseDefinitionId: string; caseDefinitionTitle: string}[] {
    const uniqueMap = new Map();

    artifacts.forEach(artifact => {
      const {caseDefinitionId, caseDefinitionTitle} = artifact;
      // Create a unique key combining both caseDefinitionId and caseDefinitionTitle
      const uniqueKey = `${caseDefinitionId}-${caseDefinitionTitle}`;

      if (!uniqueMap.has(uniqueKey)) {
        uniqueMap.set(uniqueKey, {caseDefinitionId, caseDefinitionTitle});
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) =>
      a.caseDefinitionTitle.localeCompare(b.caseDefinitionTitle)
    );
  }

  private getArtifactId(artifact: Artifact): string {
    return `${artifact.caseDefinitionId}-${artifact.version}`;
  }
}
