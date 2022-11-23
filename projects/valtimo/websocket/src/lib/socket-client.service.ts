import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, filter, first, Observable, switchMap} from 'rxjs';
import {ConfigService} from '@valtimo/config';
import {Client, StompSubscription} from '@stomp/stompjs';

/**
 * This service will open a websocket connection as soon it is created.
 * Only when the application is closed will the connection be disconnected.
 *
 * Within the application this service will make sure that only a single connection
 * is required. The topic for the onMessage method will then be used to distribute
 * the received messages to the correct part of the application.
 */
@Injectable({
  providedIn: 'root'
})
export class SocketClientService implements OnDestroy {
  private readonly valtimoSocketUri: string;
  private readonly client: Client;
  private state: BehaviorSubject<SocketClientState>
  private reconnectLimit: number = 0;

  constructor(private configService: ConfigService) {
    this.valtimoSocketUri = configService.config.valtimoApi.socketUri;
    this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING)
    this.client = new Client({
      brokerURL: this.valtimoSocketUri,
      // connectHeaders: {
      //   login: 'user',
      //   passcode: 'password',
      // },
      debug: function (str) {
        console.log(str);
      },
      //reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      logRawCommunication: true,
    })

    // if(typeof WebSocket !== 'function') {
    //   this.client.webSocketFactory= function () {
    //     return new SockJS("http://broker.329broker.com/stomp");
    //   };
    // }
    this.client.beforeConnect = () => {
      console.log("Attempt connection to web socket :: " + this.valtimoSocketUri);
      this.state.next(SocketClientState.ATTEMPTING)

      if (this.reconnectLimit < 1 ) {
        this.reconnectLimit = 3;
      }
    }

    this.client.onConnect = (frame) => {
      // Do something, all subscribes must be done is this callback
      // This is needed because this will be executed after a (re)connect
      console.log("Successfully connected web socket :: " + this.valtimoSocketUri);
      this.state.next(SocketClientState.CONNECTED);
    };

    this.client.onStompError = (event) => {
      console.log('[STOMP ERROR]');
      this.state.next(SocketClientState.ERROR);
    }

    this.client.onWebSocketError = (event) => {
      console.log('[Web Socket ERROR]');
      this.state.next(SocketClientState.ERROR);

      this.reconnectLimit = this.reconnectLimit - 1;
      if (this.reconnectLimit < 1) {
        console.log('Reached the maximum amount of retries, deactivating the websocket client');
        this.ngOnDestroy()
      }
    }

    this.client.activate();
  }

  private connect(): Observable<Client> {
    return new Observable<Client>(observer => {
      this.state
        .pipe(
          filter(state => state === SocketClientState.CONNECTED)
        )
        .subscribe(() => {
          observer.next(this.client)
        });
    });
  }

  ngOnDestroy() {
    this.connect()
      .pipe(first())
      .subscribe(client => client.deactivate());
  }

  onMessage(topic: string): Observable<any> {
    return this.connect().pipe(first(), switchMap(client => {
      return new Observable<any>(observer => {
        const subscription: StompSubscription = client.subscribe(topic, message => {
          console.log('Received a message from the server for the topic ' + topic)
          observer.next(JSON.parse(message.body));
        });
        console.log('Unsubscribing from the web socket client');
        return () => client.unsubscribe(subscription.id);
      })
    }))
  }
}

export enum SocketClientState {
  ATTEMPTING, CONNECTED, ERROR
}
