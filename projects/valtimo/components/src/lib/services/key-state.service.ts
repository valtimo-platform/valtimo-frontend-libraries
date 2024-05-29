import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KeyStateService {
  private isCtrlOrCmdPressed: boolean = false;

  constructor() {
    const keyDowns$: Observable<boolean> = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      map(event => event.ctrlKey || event.metaKey)
    );

    const keyUps$: Observable<boolean> = fromEvent<KeyboardEvent>(document, 'keyup').pipe(
      map(() => false)
    );

    merge(keyDowns$, keyUps$).subscribe(isPressed => {
      this.isCtrlOrCmdPressed = isPressed;
    });
  }

  public getCtrlOrCmdState(): boolean {
    return this.isCtrlOrCmdPressed;
  }
}
