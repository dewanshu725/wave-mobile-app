import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { ACCESS_TOKEN, REFRESH_TOKEN, TRUSTED_DEVICE } from '../helpers/constents';
import { getDataParems, getUserData, setDataParems, USER_OBJ } from '../helpers/models';
import { AppDataShareService } from './app-data-share.service';



@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private accessToken: string;
  private refreshToken: string;
  private userObject: string;
  private interestCategory: string;

  get userObj(): USER_OBJ{
    return this.userObject ? JSON.parse(this.userObject) : null
  }

  constructor(private appDataShareService: AppDataShareService) { }

  async setTrustedDevice(){
    await Storage.set({key: TRUSTED_DEVICE, value: 'true'});
  }
  
  async setItem(parems: setDataParems){

    const trustedDeviceStor = await Storage.get({key: TRUSTED_DEVICE});

    if (trustedDeviceStor.value){

      if(parems.accessToken){
        await Storage.set({key: ACCESS_TOKEN, value: parems.accessToken});
      }

      if(parems.refreshToken){
        await Storage.set({key: REFRESH_TOKEN, value: parems.refreshToken});
      }
    }
    else{

      if(parems.accessToken){
        this.accessToken = parems.accessToken;
      }

      if(parems.refreshToken){
        this.refreshToken = parems.refreshToken;
      }
    }

    if(parems.userObject){
      this.userObject = JSON.stringify(parems.userObject);
      this.appDataShareService.updateUserData.next(true);
    }

    if(parems.interestCategory){
      this.interestCategory = parems.interestCategory;
      this.appDataShareService.studentInterestChanged.next(true);
    }
  }

  async getItem(parems: getDataParems){
    const userData: getUserData = {};

    const trustedDeviceStor = await Storage.get({key: TRUSTED_DEVICE});

    if (trustedDeviceStor.value){
      userData.trustedDevice = true;

      if(parems.accessToken){
        const accessTokenStor = await Storage.get({key: ACCESS_TOKEN});
        userData.accessToken = accessTokenStor.value;
      }

      if(parems.refreshToken){
        const refreshTokenStor = await Storage.get({key: REFRESH_TOKEN});
        userData.refreshToken = refreshTokenStor.value;
      }
    }
    else{
      userData.trustedDevice = false;

      if(parems.accessToken){
        userData.accessToken = this.accessToken;
      }

      if(parems.refreshToken){
        userData.refreshToken = this.refreshToken;
      }
    }

    parems.userObject ? userData.userObject = (this.userObject ? JSON.parse(this.userObject) : null) : null;
    parems.interestCategory ? userData.interestCategory = (this.interestCategory ? JSON.parse(this.interestCategory) : null) : null;

    return userData;
  }

  async removeItem(){
    this.accessToken = null;
    this.refreshToken = null;
    this.userObject = null;
    this.interestCategory = null;

    await Storage.remove({key: TRUSTED_DEVICE});
    await Storage.remove({key: ACCESS_TOKEN});
    await Storage.remove({key: REFRESH_TOKEN});
  }
}
