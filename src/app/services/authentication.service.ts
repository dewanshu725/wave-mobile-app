import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { createStudentInterest, createUserObj } from '../helpers/functions';
import { EMAIL_LOGIN_MUTATION, USERNAME_LOGIN_MUTATION } from '../helpers/graphql.query';
import { AppDataShareService } from './app-data-share.service';
import { GraphqlService } from './graphql.service';
import { UserDataService } from './user-data.service';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private router: Router,
    private graphqlService: GraphqlService,
    private userDataService: UserDataService,
    private websocketService:WebsocketService,
    private appDataShareService: AppDataShareService
  ) { }

  login(emailOrUsername:string, password:string, usernamePresent:boolean, trustedDevice:boolean): Promise<boolean|string>{
    return new Promise<boolean|string>((resolve, reject) => {
      const mutationArrgs = {
        "password":password
      }
      let LOGIN_MUTATION_TYPE;
  
      if (usernamePresent){
        mutationArrgs['username'] = emailOrUsername;
        LOGIN_MUTATION_TYPE = USERNAME_LOGIN_MUTATION;
      }
      else{
        mutationArrgs['email'] = emailOrUsername;
        LOGIN_MUTATION_TYPE = EMAIL_LOGIN_MUTATION;
      }

      this.graphqlService.graphqlMutation(LOGIN_MUTATION_TYPE, mutationArrgs).pipe(take(1))
      .subscribe(
        async (auth_result:any) => {
          if(!auth_result.data.tokenAuth.errors){

            if (trustedDevice === true){
              await this.userDataService.setTrustedDevice();
            }

            const tokenAuth = auth_result.data.tokenAuth;
            const user = tokenAuth.user;
            const token = tokenAuth.token;
            const refreshToken = tokenAuth.refreshToken;
            const userObj = createUserObj(user);

            this.appDataShareService.studentInterest = createStudentInterest(user.studentprofile.relatedstudentinterestkeywordSet.edges);
            await this.userDataService.setItem({accessToken: token, refreshToken: refreshToken, userObject: userObj});
            await this.graphqlService.resetApolloClient();

            const initialData = await this.graphqlService.getInitialData();

            if (initialData){
              this.graphqlService.studentInterestSnapshot();
              this.websocketService.online().subscribe(() =>{});
              await this.graphqlService.onLoginChange(true);
              this.router.navigateByUrl('/wave-app');
            }
            else{
              await this.graphqlService.onLoginChange(false);
              resolve(false);
            }
            /*
            const allInterestCategory = await this.graphqlService.getAllInterestCategory();
            const allMyVue = await this.graphqlService.getAllMyVue();
            const allMyDiscovery = await this.graphqlService.getAllMyDiscovery();
            const allContact = await Promise.all([
              this.graphqlService.getContact(ALL_INTERACTION_DRAFT_CONVERSE),
              this.graphqlService.getContact(ALL_INTERACTION_CONVERSE),
              this.graphqlService.getContact(ALL_INTERACTION_EXPLORERS)
            ]);

            if (allInterestCategory && allMyVue && allMyDiscovery && !allContact.includes(false)){
              this.graphqlService.initialTokenRefresh = false;
              this.graphqlService.studentInterestSnapshot();
              this.websocketService.online().subscribe(() =>{});
              this.graphqlService.resetApolloClient();
              this.graphqlService.onLoginChange(true);
              this.router.navigate(['/']);
            }
            else{
              this.userDataService.removeItem();
              resolve(false);
            }
            */
          }
          else{
            const loginErrorCodeSubject = auth_result.data.tokenAuth.errors.nonFieldErrors[0].code;
            resolve(loginErrorCodeSubject);
          }

        },
        async error =>{
          resolve(false);
        }
      );
    });
  }

  isAuthenticated(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if (this.graphqlService.isLogin != undefined){
        resolve(this.graphqlService.isLogin);
      }
      else{
        if (this.graphqlService.initialTokenRefresh === true){
          this.graphqlService.getLoginStatus().pipe(take(1))
          .subscribe(result =>{
            resolve(result);
          });
        }
        else{
          resolve(false);
        }
      }
    });
  }


}
