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
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BehaviorSubject, combineLatest, fromEvent, Observable, Subscription} from 'rxjs';
import {debounceTime, filter, map, take} from 'rxjs/operators';
import {ConfigService, CustomLeftSidebar, MenuItem} from '@valtimo/config';
import {MenuService} from '../menu/menu.service';
import {ShellService} from '../../services/shell.service';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'valtimo-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.scss'],
})
export class LeftSidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('toggleButton') toggleButtonRef: ElementRef;

  @Input() menuIsOpen: boolean;
  @Output() menuWidthChanged: EventEmitter<number> = new EventEmitter();

  readonly menuTooltipText$ = this.translateService.stream('interface.mainMenu');
  readonly toggleMenuText$ = this.translateService.stream('interface.toggleMenu');

  readonly mouseIsOnResizeBorder$ = new BehaviorSubject<boolean>(false);
  readonly menuWidth$ = new BehaviorSubject<number>(undefined);
  readonly isResizing$ = new BehaviorSubject<boolean>(false);

  private bodyStyle: any;

  private xOnClick: number;
  private menuWidthOnClick: number;

  private mouseXSubscription: Subscription;
  private mouseUpSubscription: Subscription;
  private breakpointSubscription!: Subscription;

  private defaultMenuWidth!: number;
  private maxMenuWidth!: number;
  private minMenuWidth!: number;

  private readonly mouseX$ = fromEvent(document.body, 'mousemove').pipe(
    map((e: MouseEvent) => e.pageX)
  );

  readonly menuItems$: Observable<Array<MenuItem>> = this.menuService.menuItems$;

  readonly sideBarExpanded$ = this.shellService.sideBarExpanded$;

  private breakpointsInitialized = false;
  private lastSmallScreen!: boolean;
  private lastLargeScreen!: boolean;

  @HostListener('document:click', ['$event.target'])
  public onPageClick(targetElement) {
    combineLatest([
      this.shellService.sideBarExpanded$,
      this.shellService.mouseOnTopBar$,
      this.shellService.largeScreen$,
    ])
      .pipe(take(1))
      .subscribe(([sideBarExpanded, mouseOnTopBar, largeScreen]) => {
        const clickedInside =
          this.elementRef.nativeElement.contains(targetElement) || mouseOnTopBar;

        if (!clickedInside && !largeScreen && sideBarExpanded) {
          this.shellService.setSideBarExpanded(false);
        }
      });
  }

  readonly currentRoute$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(event => (event as NavigationEnd)?.url)
  );

  readonly closestSequence$: Observable<string> = combineLatest([
    this.currentRoute$,
    this.menuItems$,
  ]).pipe(
    map(([currentRoute, menuItems]) => {
      let closestSequence = '0';
      let highestDifference = 0;

      const checkItemMatch = (stringUrl: string, sequence: string): void => {
        const currentRouteUrlLength = currentRoute.length;
        const currentRouteSubstractLength = currentRoute.replace(stringUrl, '').length;
        const difference = currentRouteUrlLength - currentRouteSubstractLength;

        if (difference > highestDifference) {
          highestDifference = difference;
          closestSequence = sequence;
        }
      };

      menuItems.forEach(item => {
        checkItemMatch(item.link?.join('') || '', `${item.sequence}`);

        if (item.children) {
          item.children.forEach(childItem => {
            if (Array.isArray(childItem.link)) {
              checkItemMatch(
                Array.isArray(item.link)
                  ? [...item.link, ...childItem.link].join('')
                  : childItem.link.join(''),
                `${item.sequence}${childItem.sequence}`
              );
            }
          });
        }
      });

      return closestSequence;
    })
  );

  constructor(
    private readonly translateService: TranslateService,
    private readonly elementRef: ElementRef,
    private readonly configService: ConfigService,
    private readonly menuService: MenuService,
    private readonly shellService: ShellService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly router: Router
  ) {
    this.bodyStyle = elementRef.nativeElement.ownerDocument.body.style;
  }

  ngOnInit(): void {
    const customLeftSidebar = this.configService.config.customLeftSidebar;

    this.setInitialWidth(customLeftSidebar);
  }

  ngAfterViewInit(): void {
    this.openBreakpointSubscription();

    this.mouseXSubscription = combineLatest([this.mouseX$, this.isResizing$])
      .pipe(debounceTime(3))
      .subscribe(([x, isResizing]) => {
        const menuOpen = this.menuIsOpen;

        if (isResizing) {
          const offSetWidth = this.xOnClick - x;
          const newMenuWidth = this.menuWidthOnClick - offSetWidth;
          const snapMargin = 35;
          const snapInside = newMenuWidth < this.minMenuWidth - snapMargin;
          const snapOutside = !menuOpen && offSetWidth < -snapMargin;

          if (menuOpen && newMenuWidth <= this.maxMenuWidth && newMenuWidth >= this.minMenuWidth) {
            this.setMenuWidth(newMenuWidth);
          } else if (snapInside || snapOutside) {
            this.snapMenu(snapInside ? this.menuWidthOnClick : this.defaultMenuWidth);
          }
        }
      });

    this.mouseUpSubscription = fromEvent(document, 'mouseup').subscribe(() => {
      this.stopResizing();
    });
  }

  ngOnDestroy(): void {
    this.mouseXSubscription.unsubscribe();
    this.mouseUpSubscription.unsubscribe();
    this.breakpointSubscription?.unsubscribe();
  }

  enterBorder(): void {
    this.mouseIsOnResizeBorder$.next(true);
  }

  leaveBorder(): void {
    this.mouseIsOnResizeBorder$.next(false);
  }

  resizeBorderClick(e: MouseEvent): void {
    this.menuWidth$.pipe(take(1)).subscribe(menuWidth => {
      this.menuWidthOnClick = menuWidth;
      this.xOnClick = e.pageX;
      this.bodyStyle.userSelect = 'none';
      this.bodyStyle.cursor = 'col-resize';
      this.isResizing$.next(true);
    });
  }

  toggled(): void {
    console.log('toggled');
  }

  checkSequence(sequence: string): void {
    console.log('sequence', sequence);
  }

  private setInitialWidth(customLeftSidebar: CustomLeftSidebar | undefined): void {
    const localMenuWidth = localStorage.getItem('menuWidth');
    const localMenuWidthNumber = localMenuWidth ? Number(localMenuWidth) : undefined;

    this.defaultMenuWidth = localMenuWidthNumber || customLeftSidebar?.defaultMenuWidth || 230;
    this.maxMenuWidth = customLeftSidebar?.maxMenuWidth || 330;
    this.minMenuWidth = customLeftSidebar?.minMenuWidth || 120;
    this.setMenuWidth(this.defaultMenuWidth);
  }

  private snapMenu(snapTo: number): void {
    this.stopResizing();
    this.setMenuWidth(snapTo);
    setTimeout(() => {
      this.toggleButtonRef.nativeElement.click();
    });
  }

  private stopResizing(): void {
    this.bodyStyle.cursor = 'auto';
    this.bodyStyle.userSelect = 'auto';
    this.isResizing$.next(false);
    localStorage.setItem('menuWidth', this.menuWidth$.getValue().toString());
  }

  private setMenuWidth(width: number): void {
    this.menuWidth$.next(width);
    this.menuWidthChanged.emit(width);
  }

  private openBreakpointSubscription(): void {
    this.breakpointObserver
      .observe(['(max-width: 1055px)', '(min-width: 1056px)'])
      .subscribe(state => {
        this.shellService.sideBarExpanded$.pipe(take(1)).subscribe(sideBarExpanded => {
          const breakpoints = state.breakpoints;
          const breakpointKeys = Object.keys(breakpoints);
          const smallScreen = breakpoints[breakpointKeys[0]];
          const largeScreen = breakpoints[breakpointKeys[1]];

          if (!this.breakpointsInitialized) {
            if (smallScreen) {
              this.shellService.toggleSideBar();
            }
            this.breakpointsInitialized = true;
          }

          if (
            (this.lastSmallScreen && largeScreen && !sideBarExpanded) ||
            (this.lastLargeScreen && smallScreen && sideBarExpanded)
          ) {
            this.shellService.toggleSideBar();
          }

          this.lastSmallScreen = smallScreen;
          this.lastLargeScreen = largeScreen;
          this.shellService.setLargeScreen(largeScreen);
        });
      });
  }
}
