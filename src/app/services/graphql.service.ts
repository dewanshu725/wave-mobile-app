import { Injectable, isDevMode } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Network } from '@capacitor/network';
import { WebsocketService } from './websocket.service';

import { Apollo } from 'apollo-angular';
import { createUploadLink } from 'apollo-upload-client';
import { split, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';

import { DEV_PROD, ERROR_MESSAGE } from '../helpers/constents';
import { UserDataService } from './user-data.service';
import { AppDataShareService } from './app-data-share.service';
import { createStudentInterest, createUserObj } from '../helpers/functions';
import { ALL_INTEREST_CATEGORY, ME_QUERY, REFRESH_TOKEN_MUTATION, STUDENT_INTEREST_SNAPSHOT } from '../helpers/graphql.query';
import { IonicControllerService } from './ionic-controller.service';
import { INTEREST_CATEGORY, INTEREST_KEYWORD } from '../helpers/models';


@Injectable({
  providedIn: 'root'
})
export class GraphqlService {

  webSocketClient: SubscriptionClient;

  constructor(
    private apollo: Apollo,
    private userDataService: UserDataService,
    private websocketService:WebsocketService,
    private appDataShareService: AppDataShareService,
    private ionicControllerService: IonicControllerService
  ) {
    this.startApolloClient();
  }

  private async startApolloClient(){
    const http = createUploadLink({
      uri: isDevMode() ? DEV_PROD.httpServerUrl_dev + 'graphql/' : DEV_PROD.httpServerUrl_prod + 'graphql/',
      withCredentials: true,
    });

    const userData = await this.userDataService.getItem({accessToken:true});
 
    const headerMiddleware = setContext((operation, context) => {
      return {
        headers: {
          'Accept': 'charset=utf-8',
          'Authorization': userData.accessToken ? 'JWT '+ userData.accessToken : ''
        }
      };
    });

    const graphqlError = onError(({ graphQLErrors, networkError, operation, forward }) =>{
      if (graphQLErrors){

      }
      if (networkError){
        switch (operation.operationName){
          case 'Refresh_Token':
            if (this.initialTokenRefresh){
              this.onLoginChange(false);
              this.ionicControllerService.simpleToast(ERROR_MESSAGE.login_error);
            }
            else{
              this.onTokenRefreshFailedChange(true);
            }
        }
      }
    });

    const http_link = ApolloLink.from([graphqlError, headerMiddleware, http]);

    // Create a WebSocket link:
    this.webSocketClient = new SubscriptionClient(
      isDevMode() ? 
      DEV_PROD.wsServerUrl_dev + 'graphql/' + userData.accessToken : 
      DEV_PROD.wsServerUrl_prod + 'graphql/' + userData.accessToken,
      {
        reconnect: true,
        lazy: true
      }
    );

    const ws = new WebSocketLink(this.webSocketClient);


    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    interface Definintion {
      kind: string;
      operation?: string;
    };

    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation }: Definintion = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      ws,
      http_link,
    );

    this.apollo.create({
      link,
      cache: new InMemoryCache()
    });
  };

  graphqlQuery({query, variable, fetchPolicy='cache-first'}: {query:any, variable?:any, fetchPolicy?:any}){
    return this.apollo.watchQuery({query: query, variables: variable, errorPolicy:'all', fetchPolicy:fetchPolicy});
  }

  graphqlMutation(mutation:any, variable?:any){
    return this.apollo.mutate({ mutation:mutation, variables:variable, errorPolicy:'all'});
  }

  subscription(query:any, variable?:any){
    return this.apollo.subscribe({query:query, variables:variable});
  }

  private closeGraphqlSubscription(){
    this.webSocketClient.unsubscribeAll();
    this.webSocketClient.close(true);
  }

  async resetApolloClient(){
    this.closeGraphqlSubscription();
    await this.apollo.client.clearStore();
    this.apollo.removeClient();
    await this.startApolloClient();
  }

  // 'isLogin' Observable setup
  private _isLogin: boolean;
  private isLoginSubject = new Subject<boolean>();

  get isLogin(){return this._isLogin};

  async onLoginChange(status:boolean){
    this._isLogin = status;
    this.isLoginSubject.next(status);
    this.tokenRefreshWaiting = false;
    if (status){
      await this.startRefreshTokenTimer();
      this.onTokenRefreshFailedChange(false);
    }
    else{
      await this.userDataService.removeItem();
      this.appDataShareService.reset();
      this.websocketService.closeConnection();
      await this.resetApolloClient();
      this.stopRefreshTokenTimer();
      this.onTokenRefreshFailedChange(true);
    }
  }

  getLoginStatus(): Observable<boolean>{
    return this.isLoginSubject.asObservable();
  }

  initialTokenRefresh:boolean;
  private tokenRefreshWaiting = false;

  // 'tokenRefreshFailed' Observable setup
  private tokenRefreshFailed = false;
  private tokenRefreshFailedSubject = new Subject<boolean>();

  private onTokenRefreshFailedChange(status:boolean){
    this.tokenRefreshFailed = status;
    this.tokenRefreshFailedSubject.next(status);
  }

  getTokenRefreshFailedStatus(): Observable<boolean>{
    return this.tokenRefreshFailedSubject.asObservable();
  }

  refreshTokenTimeout:any;

  async startRefreshTokenTimer(){
    const userData = await this.userDataService.getItem({accessToken:true});
    const access_token = userData.accessToken;
    const jwtToken = JSON.parse(atob(access_token.split('.')[1]));
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.getNewToken(), timeout);
  }

  stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  isTokenValid(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if (this.tokenRefreshFailed === true || this.tokenRefreshWaiting === true){

        this.getTokenRefreshFailedStatus().pipe(take(1))
        .subscribe(status =>{status ? resolve(false) : resolve(true);});

        this.tokenRefreshFailed === true ? this.getNewToken() : null;
      }
      else{
        resolve(true);
      }
    });
  }


  async getNewToken(){
    const networkStatus = await Network.getStatus();

    if (networkStatus.connected){
      const userData = await this.userDataService.getItem({refreshToken:true});
      const token = userData.refreshToken;
      if (token){
        const token_arrgs = {"refresh_token": token}
        this.graphqlMutation(REFRESH_TOKEN_MUTATION, token_arrgs).pipe(take(1))
        .subscribe(
          async (result:any) =>{
            const refresh_token_data = result.data.refreshToken;

            if (!refresh_token_data.errors){
              const access_token = refresh_token_data.token;
              const refresh_token = refresh_token_data.refreshToken;

              await this.userDataService.setItem({accessToken:access_token, refreshToken:refresh_token});
              await this.resetApolloClient();

              if (this.initialTokenRefresh === true){
                await this.studentInterestSnapshot();
                const userDataResult = await this.getUserData();

                if (userDataResult === true){
                  const initialData = await this.getInitialData();

                  if (initialData){
                    this.initialTokenRefresh = false;
                    this.websocketService.online().subscribe(() => {});
                    this.onLoginChange(true);
                  }
                  else{
                    this.onLoginChange(false);
                  }
                  /*
                  const allInterestCategory = await this.getAllInterestCategory();
                  const allMyVue = await this.getAllMyVue();
                  const allMyDiscovery = await this.getAllMyDiscovery();
                  const allContact = await Promise.all([ 
                    this.getContact(ALL_INTERACTION_DRAFT_CONVERSE),
                    this.getContact(ALL_INTERACTION_CONVERSE),
                    this.getContact(ALL_INTERACTION_EXPLORERS)
                  ]);

                  if (allInterestCategory && allMyVue && allMyDiscovery && !allContact.includes(false)){
                    this.initialTokenRefresh = false;
                    this.studentInterestSnapshot();
                    this.websocketService.online().subscribe(() =>{});
                    this.onLoginChange(true);
                  }
                  else{
                    this.onLoginChange(false);
                  }
                  */
                }
                else{
                  this.onLoginChange(false);
                }
              }
              else{
                this.onLoginChange(true);
              }
            }
            else{
              this.onLoginChange(false);
            }

          }
        )
      }
      else{
        this.onLoginChange(false);
      }
    }
    else{
      this.tokenRefreshWaiting = true;

      this.appDataShareService.networkStatusChanged.pipe(take(1)).subscribe(() => this.getNewToken());
    }
  }


  getUserData(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.graphqlMutation(ME_QUERY).pipe(take(1))
      .subscribe(
        async (result:any) => {
          const user = result.data.me;
          const userObj = createUserObj(user);

          this.appDataShareService.studentInterest = createStudentInterest(user.studentprofile.relatedstudentinterestkeywordSet.edges);

          await this.userDataService.setItem({userObject: userObj});
          resolve(true);
        },
        error =>{
          resolve(false);
        },
      );
    });
  }

  getInitialData(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      (async () => {
        const allInterestCategory = await this.getAllInterestCategory();

        if (allInterestCategory){
          resolve(true);
        }
        else{
          resolve(false);
        }
        /*
        const allMyVue = await this.getAllMyVue();
        const allMyDiscovery = await this.getAllMyDiscovery();
        const allContact = await Promise.all([ 
          this.getContact(ALL_INTERACTION_DRAFT_CONVERSE),
          this.getContact(ALL_INTERACTION_CONVERSE),
          this.getContact(ALL_INTERACTION_EXPLORERS)
        ]);

        if (allInterestCategory && allMyVue && allMyDiscovery && !allContact.includes(false)){
          resolve(true);
        }
        else{
          resolve(false);
        }
        */
      })();
    });
  }

  getAllInterestCategory(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.graphqlQuery({query:ALL_INTEREST_CATEGORY}).valueChanges.pipe(take(1))
      .subscribe(
        async (result:any) =>{
          const selected_interest = this.appDataShareService.studentInterest.length > 0 ? this.appDataShareService.studentInterest : null;
          const all_interest_category:INTEREST_CATEGORY[] = [];
          result.data.allInterestCategory.edges.forEach(interest_category => {

            const interest_keyword_set:INTEREST_KEYWORD[] = [];
            interest_category.node.interestkeywordSet.edges.forEach(interest => {

              let selected = false;
              if (selected_interest != null){
                selected_interest.forEach(user_interest =>{ user_interest.id === interest.node.id && user_interest.saved === true ? selected = true : null; });
              }

              interest_keyword_set.push(
                {
                  id:interest.node.id,
                  name:interest.node.word,
                  selected:selected
                }
              );
            });
            all_interest_category.push(
              {
                name:interest_category.node.name,
                interest_keyword:interest_keyword_set
              }
            );

          });

          await this.userDataService.setItem({interestCategory:JSON.stringify(all_interest_category)});
          resolve(true);
        },
        error => resolve(false)
      );
    });
  }

  studentInterestSnapshot(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.graphqlMutation(STUDENT_INTEREST_SNAPSHOT).pipe(take(1)).subscribe(
        (result:any) =>{
          if (result.data.studentInterestSnapshot.result){
            resolve(true);
          }
          else{
            resolve(false);
          }
        },
        error => resolve(false)
      );
    });
  }

}



