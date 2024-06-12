import {Injectable, signal} from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class WidgetJsonEditorService {
  public readonly showPendingModal = signal<boolean>(false);
}
