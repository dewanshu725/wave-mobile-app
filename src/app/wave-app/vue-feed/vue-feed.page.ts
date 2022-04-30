import { Component, OnDestroy, OnInit } from '@angular/core';
import { LOCATION_PREFERENCE } from 'src/app/helpers/constents';
import { INTEREST_KEYWORD, USER_OBJ, VUE, VUE_FEED_IDS, VUE_FEED_UPDATED } from 'src/app/helpers/models';
import { AppDataShareService } from 'src/app/services/app-data-share.service';
import { ModalController } from '@ionic/angular';
import { SelectedInterestModalComponent } from 'src/app/shared/selected-interest-modal/selected-interest-modal.component';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { UserDataService } from 'src/app/services/user-data.service';
import { GET_VUE_FEED_FROM_IDS, GET_VUE_FEED_IDS } from 'src/app/helpers/graphql.query';
import { GraphqlService } from 'src/app/services/graphql.service';
import { createVueObj } from 'src/app/helpers/functions';
import { DisplayDetailedVueComponent } from 'src/app/shared/display-detailed-vue/display-detailed-vue.component';


@Component({
  selector: 'app-vue-feed',
  templateUrl: './vue-feed.page.html',
  styleUrls: ['./vue-feed.page.scss'],
})
export class VueFeedPage implements OnInit, OnDestroy {

  constructor(
    private graphqlService: GraphqlService,
    private userDataService: UserDataService,
    private appDataShareService: AppDataShareService,
    private modalController: ModalController
  ) { }

  destroy$: Subject<boolean> = new Subject<boolean>();
  currentSelectedInterest$:Subscription;
  title = 'Vue';
  userObj:USER_OBJ;

  currentSelectedInterest:INTEREST_KEYWORD[] = [];

  loading = false;
  vueError = false;

  vueFeedLength = 3;
  vueFeedLocationPreference:string;
  vueFeedIds:VUE_FEED_IDS[] = [];
  vueFeedArray:VUE[] = [];
  filteredvueFeedIds:VUE_FEED_IDS[] = [];
  filteredVueFeedArray:VUE[] = [];
  

  ngOnInit() {
    this.userObj = this.userDataService.userObj;
    this.vueFeedLocationPreference = this.userObj.locationPreference;
    this.getVueFeed();
  }

  ionViewDidEnter(){
    this.currentSelectedInterest$ = this.appDataShareService.currentSelectedInterestChanged.subscribe((interest:INTEREST_KEYWORD[]) => {
      this.currentSelectedInterest = interest;
      this.filterVueFeed();
    });

    this.appDataShareService.updateUserData.pipe(takeUntil(this.destroy$)).subscribe(async() => {
      this.userObj = (await this.userDataService.getItem({userObject:true})).userObject;
    });

    this.appDataShareService.vueChanged.pipe(takeUntil(this.destroy$)).subscribe((changedVue:VUE_FEED_UPDATED) => {
      const vueFeedArrayIndex = this.vueFeedArray.findIndex(vue => vue.id === changedVue.vue_id);
      if (vueFeedArrayIndex > -1){
        this.vueFeedArray[vueFeedArrayIndex].user_opened = changedVue.opened;
        this.vueFeedArray[vueFeedArrayIndex].user_saved = changedVue.saved;
        this.vueFeedArray[vueFeedArrayIndex].conversation_started = changedVue.conversation_started;
      }

      const filteredVueFeedArrayIndex = this.filteredVueFeedArray.findIndex(vue => vue.id === changedVue.vue_id);
      if (filteredVueFeedArrayIndex > -1){
        this.vueFeedArray[filteredVueFeedArrayIndex].user_opened = changedVue.opened;
        this.vueFeedArray[filteredVueFeedArrayIndex].user_saved = changedVue.saved;
        this.vueFeedArray[filteredVueFeedArrayIndex].conversation_started = changedVue.conversation_started;
      }
    });

    this.appDataShareService.vueReported.pipe(takeUntil(this.destroy$)).subscribe((vue_id:string) => {
      const vueFeedIdsIndex = this.vueFeedIds.findIndex(vue_feed => vue_feed.id === vue_id);
      if (vueFeedIdsIndex > -1){
        this.vueFeedIds.splice(vueFeedIdsIndex, 1);
      }

      const vueFeedArrayIndex = this.vueFeedArray.findIndex(vue => vue.id === vue_id);
      if (vueFeedArrayIndex > -1){
        this.vueFeedArray.splice(vueFeedArrayIndex, 1);
      }

      const filteredvueFeedIdsIndex = this.filteredvueFeedIds.findIndex(vue_feed => vue_feed.id === vue_id);
      if (filteredvueFeedIdsIndex > -1){
        this.filteredvueFeedIds.splice(filteredvueFeedIdsIndex, 1);
      }

      const filteredVueFeedArrayIndex = this.filteredVueFeedArray.findIndex(vue => vue.id === vue_id);
      if (filteredVueFeedArrayIndex > -1){
        this.filteredVueFeedArray.splice(filteredVueFeedArrayIndex, 1);
      }
    });
  }

  resetVueFeed(){
    this.vueFeedIds = [];
    this.vueFeedArray = [];
  }

  getVueFeed(){
    this.loading = true;
    this.vueError = false;

    const mutationArrgs = {
      locationPreference: this.vueFeedLocationPreference
    }

    this.graphqlService.graphqlMutation(GET_VUE_FEED_IDS, mutationArrgs).pipe(take(1)).subscribe(
      (result:any) => {
        if (result.data.vueFeedIds != null){
          if (result.data.vueFeedIds.recommendedVues != null){
            result.data.vueFeedIds.recommendedVues.forEach(vue_id => {
              this.vueFeedIds.push({id: vue_id, special: true});
            });
          }

          if (result.data.vueFeedIds.vueFeed != null){
            result.data.vueFeedIds.vueFeed.forEach(vue_id => {
              this.vueFeedIds.push({id: vue_id, special: false});
            });
          }

          if (this.vueFeedIds.length != 0){
            const vueIdsToFetch = [];
            this.vueFeedIds.slice(0, this.vueFeedLength).forEach(element => vueIdsToFetch.push(element.id));

            this.graphqlService.graphqlMutation(GET_VUE_FEED_FROM_IDS, {vueFeedIds: vueIdsToFetch}).pipe(take(1)).subscribe(
              (result:any) => {
                if (result.data.getVueFeedFromIds.vueFeedObjs != null){
                  result.data.getVueFeedFromIds.vueFeedObjs.forEach(vueObj => {
                    const vueFeedIdIndex = this.vueFeedIds.findIndex(item => item.id === vueObj.id);
                    if (this.vueFeedIds[vueFeedIdIndex].special){
                      const vue = createVueObj(vueObj, this.userObj);
                      vue.special = true;

                      this.vueFeedArray.push(vue);
                    }
                    else{
                      this.vueFeedArray.push(createVueObj(vueObj, this.userObj));
                    }
                  });

                  this.loading = false;
                  this.vueError = false;
                }
                else{
                  this.loading = false;
                  this.vueError = true;
                }
              },
              error => {
                this.loading = false;
                this.vueError = true;
              }
            );
          }
          else{
            this.loading = false;
            this.vueError = false;
          }
        }
        else{
          this.loading = false;
          this.vueError = true;
        }
      },
      error => {
        this.loading = false;
        this.vueError = true;
      }
    );

  }
  
  getCurrentVueFeedIdToFetch(){
    const vueFeedIndex = this.vueFeedIds.findIndex(item => item.id === this.vueFeedArray[this.vueFeedArray.length - 1].id);
    if (vueFeedIndex === -1){
      return null;
    }

    const vueIds = this.vueFeedIds.slice(vueFeedIndex+1, vueFeedIndex+1+this.vueFeedLength);
    if (vueIds.length === 0){
      return null;
    }

    const vueIdsToFetch = [];
    vueIds.forEach(vue => {
      vueIdsToFetch.push(vue.id);
    })

    return vueIdsToFetch;
  }

  changeVueLocationPreference(value){
    this.vueFeedLocationPreference = value;
    this.resetVueFeed();
    this.getVueFeed();

    if (value === LOCATION_PREFERENCE.global){
      this.title = 'Global'
    }
    else if (value === LOCATION_PREFERENCE.country){
      this.title = this.userObj.location.country_name;
    }
    else if (value === LOCATION_PREFERENCE.region){
      this.title = this.userObj.location.region;
    }
    else{
      this.title = this.userObj.institution.abbreviation != null ? this.userObj.institution.abbreviation : this.userObj.institution.name;
    }
  }

  removeInterest(interest:INTEREST_KEYWORD){
    const index = this.currentSelectedInterest.findIndex(obj => obj.id === interest.id);
    if (index > -1) {
      this.currentSelectedInterest.splice(index, 1);
      this.filterVueFeed();
    }
  }

  filterVueFeed(){
    this.filteredVueFeedArray = [];
    const selectedInterestLength = this.currentSelectedInterest.length;

    this.vueFeedArray.forEach(vue => {
      let interestMatch = 0;
      vue.interest_keyword.forEach(interest => {
        this.currentSelectedInterest.forEach(selected_interest => {
          if (interest.id === selected_interest.id){
            interestMatch += 1;
            return;
          }
        });
      });

      selectedInterestLength === interestMatch ? this.filteredVueFeedArray.push(vue) : null;
    });
  }

  loadMore(event){
    const currentVueIdsToFetch = this.getCurrentVueFeedIdToFetch();
    if (currentVueIdsToFetch != null){
      this.graphqlService.graphqlMutation(GET_VUE_FEED_FROM_IDS, {vueFeedIds: currentVueIdsToFetch}).pipe(take(1)).subscribe(
        (result:any) => {
          if (result.data.getVueFeedFromIds.vueFeedObjs != null){
            result.data.getVueFeedFromIds.vueFeedObjs.forEach(vueObj => {
              const vueFeedIdIndex = this.vueFeedIds.findIndex(item => item.id === vueObj.id);
              if (this.vueFeedIds[vueFeedIdIndex].special){
                const vue = createVueObj(vueObj, this.userObj);
                vue.special = true;

                this.vueFeedArray.push(vue);
              }
              else{
                this.vueFeedArray.push(createVueObj(vueObj, this.userObj));
              }
            });
          }

          event.target.complete();
        },
        error => event.target.complete()
      );
    }
    else{
      event.target.disabled = true;
    }
  }

  async presentModal() {
    const modal = await this.modalController.create({
      mode: 'ios',
      showBackdrop: true,
      backdropDismiss: true,
      initialBreakpoint: 0.35,
      breakpoints: [0, 0.35, 0.5, 1],
      component: SelectedInterestModalComponent,
      componentProps: {selectedInterest: this.currentSelectedInterest}
    });

    await modal.present();
  }

  async openVueModal(vue:VUE) {
    const modal = await this.modalController.create({
      component: DisplayDetailedVueComponent,
      componentProps: {vue: vue}
    });

    await modal.present();
  }

  ionViewDidLeave(){
    this.currentSelectedInterest$.unsubscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
