import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IMG_RESOURCE, INTEREST_KEYWORD, VUE_FEED_UPDATED } from '../helpers/models';

@Injectable({
  providedIn: 'root'
})
export class AppDataShareService {

  constructor() { }

  networkStatusChanged = new Subject<boolean>();
  updateUserData = new Subject<boolean>();
  vueChanged = new Subject<VUE_FEED_UPDATED>();
  vueReported = new Subject<string>();

  imageResourceLocater:IMG_RESOURCE[] = [];

  studentInterest:INTEREST_KEYWORD[] = [];
  studentInterestChanged = new Subject<boolean>();
  currentSelectedInterestChanged = new Subject<INTEREST_KEYWORD[]>();


  reset(){
    this.studentInterest = [];
    this.imageResourceLocater = [];
  }

}
