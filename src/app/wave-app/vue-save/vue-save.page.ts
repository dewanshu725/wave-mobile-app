import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { createVueObj } from 'src/app/helpers/functions';
import { VUE_SAVED, VUE_SAVED_CURSOR } from 'src/app/helpers/graphql.query';
import { INTEREST_KEYWORD, USER_OBJ, VUE } from 'src/app/helpers/models';
import { AppDataShareService } from 'src/app/services/app-data-share.service';
import { GraphqlService } from 'src/app/services/graphql.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { DisplayDetailedVueComponent } from 'src/app/shared/display-detailed-vue/display-detailed-vue.component';
import { SelectedInterestModalComponent } from 'src/app/shared/selected-interest-modal/selected-interest-modal.component';

@Component({
  selector: 'app-vue-save',
  templateUrl: './vue-save.page.html',
  styleUrls: ['./vue-save.page.scss'],
})
export class VueSavePage implements OnInit {

  constructor(
    private graphqlService: GraphqlService,
    private userDataService: UserDataService,
    private appDataShareService: AppDataShareService,
    private modalController: ModalController,
  ) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  userObj:USER_OBJ;
  currentSelectedInterest:INTEREST_KEYWORD[] = [];

  loading = false;
  vueError = false;
  canLoadMore = false;
  specialVueFilter = false;
  doesSpecialVueExist = false;

  vueFeedLength = 3;
  vueFeedArray:VUE[] = [];
  filteredVueFeedArray:VUE[] = [];

  ngOnInit() {
    this.reset();
  }

  ionViewWillEnter(){
    this.reset();
  }

  ionViewDidEnter(){
    this.destroy$ = new Subject<boolean>();
    this.userObj = this.userDataService.userObj;

    this.appDataShareService.updateUserData.pipe(takeUntil(this.destroy$)).subscribe(async() => {
      this.userObj = (await this.userDataService.getItem({userObject:true})).userObject;
    });

    this.appDataShareService.currentSelectedInterestChanged.pipe(takeUntil(this.destroy$)).subscribe((interest:INTEREST_KEYWORD[]) => {
      this.currentSelectedInterest = interest;
      this.filterVueFeed();
    });

    this.appDataShareService.vueReported.pipe(takeUntil(this.destroy$)).subscribe((vue_id:string) => {
      const vueFeedArrayIndex = this.vueFeedArray.findIndex(vue => vue.id === vue_id);
      if (vueFeedArrayIndex > -1){
        this.vueFeedArray.splice(vueFeedArrayIndex, 1);
      }

      const filteredVueFeedArrayIndex = this.filteredVueFeedArray.findIndex(vue => vue.id === vue_id);
      if (filteredVueFeedArrayIndex > -1){
        this.filteredVueFeedArray.splice(filteredVueFeedArrayIndex, 1);
      }
    });

    this.getVueFeed();
  }

  reset(){
    this.loading = true;
    this.vueError = false;
    this.canLoadMore = false;
    this.specialVueFilter = false;
    this.doesSpecialVueExist = false;
    this.userObj = null;
    this.currentSelectedInterest = [];
    this.vueFeedArray = [];
    this.filteredVueFeedArray = [];
  }

  getEndCursor(): Promise<string>{
    return new Promise<string>((resolve, reject) => {
      if (this.vueFeedArray.length === 0){
        return resolve('')
      }
      else{
        const lastVueSavedId = this.vueFeedArray[this.vueFeedArray.length-1].vue_feed_id;
        this.graphqlService.graphqlMutation(VUE_SAVED_CURSOR, {vueSavedId: lastVueSavedId}).pipe(take(1)).subscribe(
          (result:any) => {
            return resolve(result.data.vueSavedCursor.cursor);
          },
          error => resolve(null)
        );
      }
    });
  }

  async getVueFeed(){
    this.loading = true;
    this.vueError = false;
    const endCursor = await this.getEndCursor();

    if (endCursor != null){
      const mutationArrgs = {
        'first': this.vueFeedLength,
        'after': endCursor
      }
  
      this.graphqlService.graphqlQuery({query:VUE_SAVED, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1)).subscribe(
        (result:any) => {
          if (result.data.vueSaved != null){
            if (result.data.vueSaved.edges.length != 0){
              this.canLoadMore = result.data.vueSaved.pageInfo.hasNextPage;
  
              result.data.vueSaved.edges.forEach(vueSaved => {
                const vue = createVueObj(vueSaved.node.vue, this.userObj);
                vue.vue_feed_id = vueSaved.node.id;
                vue.user_opened = vueSaved.node.opened;
                vue.user_saved = true;
                vue.special = vueSaved.node.special;
  
                if (vue.special){
                  this.doesSpecialVueExist = true;
                }
  
                this.vueFeedArray.push(vue);
              });
  
              this.loading = false;
              this.vueError = false;
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
    else{
      this.loading = false;
      this.vueError = true;
    }
  }

  async loadMore(event){
    if (this.canLoadMore){
      const endCursor = await this.getEndCursor();

      if (endCursor != null){
        const mutationArrgs = {
          'first': this.vueFeedLength,
          'after': endCursor
        }
  
        this.graphqlService.graphqlQuery({query:VUE_SAVED, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1)).subscribe(
          (result:any) => {
            if (result.data.vueSaved.edges.length != 0){
              this.canLoadMore = result.data.vueSaved.pageInfo.hasNextPage;
  
              result.data.vueSaved.edges.forEach(vueSaved => {
                const vue = createVueObj(vueSaved.node.vue, this.userObj);
                vue.vue_feed_id = vueSaved.node.id;
                vue.user_opened = vueSaved.node.opened;
                vue.user_saved = true;
                vue.special = vueSaved.node.special;
  
                if (vue.special){
                  this.doesSpecialVueExist = true;
                }
  
                this.vueFeedArray.push(vue);
              });
  
              if (this.canLoadMore){
                event.target.complete();
              }
              else{
                event.target.disabled = true;
              }
            }
            else{
              event.target.complete();
            }
          },
          error => {
            event.target.complete();
          }
        );
      }
      else{
        event.target.complete();
      }
    }
    else{
      event.target.disabled = true;
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

  async presentModal() {
    const modal = await this.modalController.create({
      mode: 'ios',
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
      componentProps: {vue: vue, displaySavedFeed: true}
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data != null){
      let removedVue:VUE = null;
      const vueFeedIndex = this.vueFeedArray.findIndex(vue => vue.id === data.removeVue);
      if (vueFeedIndex > -1){
        removedVue = this.vueFeedArray[vueFeedIndex];
        this.vueFeedArray.splice(vueFeedIndex, 1);
      }

      const filteredVueFeedIndex = this.filteredVueFeedArray.findIndex(vue => vue.id === data.removeVue);
      if (vueFeedIndex > -1){
        this.filteredVueFeedArray.splice(filteredVueFeedIndex, 1);
      }

      this.appDataShareService.vueChanged.next({
        vue_id: removedVue.id, 
        opened: removedVue.user_opened, 
        saved: removedVue.user_saved,
        conversation_started: removedVue.conversation_started
      })
    }
  }

  ionViewDidLeave(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
