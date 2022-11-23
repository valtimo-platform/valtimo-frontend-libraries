import {Injectable} from '@angular/core';
import {first, Observable} from 'rxjs';
import {SocketClientService} from './socket-client.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  constructor(private socketClient: SocketClientService) {}

  listenForUserTaskChanges(): Observable<any> {
    return this.listen("/topic/taskChanged");
  }

  private listen(topic: string): Observable<any> {
    return this.socketClient
      .onMessage(topic)
      .pipe(first());
  }
}
