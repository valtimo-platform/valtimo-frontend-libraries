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

import {ElementRef, Injectable} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  fromEvent,
  Observable,
  Subscription,
  take,
} from 'rxjs';
import {CarbonListComponent} from '../carbon-list.component';

@Injectable()
export class CarbonListDragAndDropService {
  private readonly _carbonListElementRefSubject$ =
    new BehaviorSubject<ElementRef<CarbonListComponent> | null>(null);
  private get _carbonListElementRef$(): Observable<ElementRef<CarbonListComponent>> {
    return this._carbonListElementRefSubject$.pipe(filter(ref => !!ref));
  }
  private readonly _tableRowsSubject$ = new BehaviorSubject<HTMLTableRowElement[] | null>(null);
  private get _tableRows$(): Observable<HTMLTableRowElement[]> {
    return this._tableRowsSubject$.pipe(filter(trs => !!trs));
  }
  private readonly _tableRowMouseOverSubject$ = new BehaviorSubject<HTMLTableRowElement | null>(
    null
  );
  private get _tableRowMouseOver$(): Observable<HTMLTableRowElement> {
    return this._tableRowMouseOverSubject$.pipe(filter(tr => !!tr));
  }

  private _mousemoveSubscription!: Subscription;
  private _mouseupSubscription!: Subscription;
  private _tableRowSubscription!: Subscription;

  public setCarbonListElementRef(ref: ElementRef<CarbonListComponent>): void {
    this._carbonListElementRefSubject$.next(ref);
  }

  public startDrag(): void {
    this.setTableRows();
    this.openMouseMoveSubscription();
    this.openTableRowSubscription();
    this.openMouseUpSubscription();
  }

  private openMouseMoveSubscription(): void {
    this._mousemoveSubscription = fromEvent(document, 'mousemove').subscribe((e: MouseEvent) => {
      const elementsUnderMouse = document.querySelectorAll(':hover');
      const arrayElementsUnderMouse = elementsUnderMouse && Array.from(elementsUnderMouse);
      const tableRowUnderMouse = arrayElementsUnderMouse?.find(
        element => element.localName === 'tr'
      );
      if (tableRowUnderMouse) this.setTableRowUnderMouse(tableRowUnderMouse as HTMLTableRowElement);
    });
  }

  private openTableRowSubscription(): void {
    this._tableRowSubscription = combineLatest([
      this._tableRows$,
      this._tableRowMouseOver$,
    ]).subscribe(([tableRows, tableRowMouseOver]) => {
      console.log(tableRows, tableRowMouseOver);
    });
  }

  private openMouseUpSubscription(): void {
    this._mouseupSubscription = fromEvent(document, 'mouseup').subscribe(() => {
      this.stopDrag();
    });
  }

  private setTableRowUnderMouse(element: HTMLTableRowElement): void {
    combineLatest([this._tableRowMouseOverSubject$, this._tableRows$])
      .pipe(take(1))
      .subscribe(([currentTableRow, tableRows]) => {
        const findTableRow = tableRows.find(row => row === element);
        if (findTableRow && currentTableRow !== findTableRow)
          this._tableRowMouseOverSubject$.next(findTableRow);
      });
  }

  private stopDrag(): void {
    this._mousemoveSubscription?.unsubscribe();
    this._mouseupSubscription?.unsubscribe();
    this._tableRowSubscription?.unsubscribe();
    this._tableRowsSubject$.next(null);
    this._tableRowMouseOverSubject$.next(null);
  }

  private setTableRows(): void {
    this._carbonListElementRef$.pipe(take(1)).subscribe(elementRef => {
      const carbonListElement = elementRef.nativeElement as any as HTMLDivElement;
      const carbonListChildren =
        carbonListElement?.children && Array.from(carbonListElement?.children);
      const tableContainerElement = carbonListChildren?.find(
        child => child.localName === 'cds-table-container'
      );
      const tableContainerElementChildren =
        tableContainerElement?.children && Array.from(tableContainerElement.children);
      const tableElement = tableContainerElementChildren?.find(
        child => child.localName === 'cds-table'
      );
      const tableElementChildren = tableElement?.children && Array.from(tableElement?.children);
      const htmlTableElement = tableElementChildren?.find(child => child.localName === 'table');
      const htmlTableElementChildren =
        htmlTableElement?.children && Array.from(htmlTableElement?.children);
      const htmlTableBodyElement = htmlTableElementChildren?.find(
        child => child.localName === 'tbody'
      );
      const htmlTableRowElements =
        htmlTableBodyElement?.children &&
        (Array.from(htmlTableBodyElement.children) as any as HTMLTableRowElement[]);

      if (htmlTableRowElements) this._tableRowsSubject$.next(htmlTableRowElements);
    });
  }
}
