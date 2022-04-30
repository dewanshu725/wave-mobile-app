import { Injectable, isDevMode } from '@angular/core';
import { Observable, from} from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { delay, retryWhen, switchMap, take, tap } from 'rxjs/operators';
import { UserDataService } from './user-data.service';
import { DEV_PROD } from '../helpers/constents';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(private userDataService: UserDataService) { }

  private online$: WebSocketSubject<any>;
  public typingStatus$: WebSocketSubject<any>;

  RETRY_SECONDS = 5000;

  async getWsUrl(path:string): Promise<string>{
    const userData = await this.userDataService.getItem({accessToken:true});
    return `${isDevMode() ? DEV_PROD.wsServerUrl_dev : DEV_PROD.wsServerUrl_prod}${path}/${userData.accessToken}`;
  }

  online(): Observable<any> {
    return from(this.getWsUrl('online')).pipe(
      switchMap(wsUrl => {
        if (this.online$) {
          return this.online$;
        } 
        else {
          this.online$ = webSocket({
            url: wsUrl,
          });
          return this.online$;
        }
      }),
      retryWhen((errors) => errors.pipe(
        delay(this.RETRY_SECONDS),
        tap(error => {
          if (this.online$ === null){
            throw error;
          }
          else{
            this.getWsUrl('online').then(wsUrl => {
              this.online$ = webSocket({
                url: wsUrl,
              });
              return this.online$;
            });
          }
        })
      ))
    )
  }

  typingStatus(interactionId:string): Observable<any> {
    return from(this.getWsUrl('usertyping')).pipe(
      switchMap(wsUrl => {
        if (this.typingStatus$) {
          return this.typingStatus$;
        } 
        else {
          this.typingStatus$ = webSocket({
            url: `${wsUrl}/${interactionId}`,
            closeObserver: {next: () => this.closeTypingStatusConnection()}
          });
          return this.typingStatus$;
        }
      }),
      retryWhen((errors) => errors.pipe(
        delay(this.RETRY_SECONDS),
        tap(error => {
          if (this.typingStatus$ === null){
            throw error;
          }
          else{
            return this.typingStatus$;
          }
        })
      ))
    );
  }

  closeTypingStatusConnection(){
    if (this.typingStatus$){
      this.typingStatus$.complete();
      this.typingStatus$ = null;
    }
  }

  closeConnection(){
    if (this.online$) {
      this.online$.complete();
      this.online$ = null;
    }

    this.closeTypingStatusConnection();
  }
}