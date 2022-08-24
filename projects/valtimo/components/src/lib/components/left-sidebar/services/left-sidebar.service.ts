import {Inject, Injectable} from '@angular/core';
import {CustomTaskList, VALTIMO_CONFIG, ValtimoConfig} from '@valtimo/config';

@Injectable({
  providedIn: 'root',
})
export class LeftSidebarService {
  constructor(@Inject(VALTIMO_CONFIG) private valtimoConfig: ValtimoConfig) {}
}
