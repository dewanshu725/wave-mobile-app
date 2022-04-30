import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { createVueObj } from 'src/app/helpers/functions';
import { VUE_HISTORY } from 'src/app/helpers/graphql.query';
import { INTEREST_KEYWORD, USER_OBJ, VUE } from 'src/app/helpers/models';
import { AppDataShareService } from 'src/app/services/app-data-share.service';
import { GraphqlService } from 'src/app/services/graphql.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { DisplayDetailedVueComponent } from 'src/app/shared/display-detailed-vue/display-detailed-vue.component';
import { SelectedInterestModalComponent } from 'src/app/shared/selected-interest-modal/selected-interest-modal.component';

@Component({
  selector: 'app-vue-history',
  templateUrl: './vue-history.page.html',
  styleUrls: ['./vue-history.page.scss'],
})
export class VueHistoryPage implements OnInit {

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
    this.userObj = null;
    this.currentSelectedInterest = [];
    this.vueFeedArray = [];
    this.filteredVueFeedArray = [];
  }

  getEndCursor(){
    if (this.vueFeedArray.length === 0){
      return ''
    }
    else{
      return this.vueFeedArray[this.vueFeedArray.length-1].cursor;
    }
  }

  getVueFeed(){
    this.loading = true;
    this.vueError = false;

    const mutationArrgs = {
      'first': this.vueFeedLength,
      'after': this.getEndCursor()
    }

    this.graphqlService.graphqlQuery({query:VUE_HISTORY, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1)).subscribe(
      (result:any) => {
        if (result.data.vueOpened != null){
          if (result.data.vueOpened.edges.length != 0){
            this.canLoadMore = result.data.vueOpened.pageInfo.hasNextPage;

            result.data.vueOpened.edges.forEach(vueOpened => {
              const vue = createVueObj(vueOpened.node.vue, this.userObj);
              vue.cursor = vueOpened.cursor;
              vue.user_opened = true;
              vue.user_saved = vueOpened.node.saved;
              vue.special = vueOpened.node.special;

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

  loadMore(event){
    if (this.canLoadMore){
      const mutationArrgs = {
        'first': this.vueFeedLength,
        'after': this.getEndCursor()
      }

      this.graphqlService.graphqlQuery({query:VUE_HISTORY, variable:mutationArrgs, fetchPolicy:'network-only'}).valueChanges.pipe(take(1)).subscribe(
        (result:any) => {
          if (result.data.vueOpened.edges.length != 0){
            this.canLoadMore = result.data.vueOpened.pageInfo.hasNextPage;

            result.data.vueOpened.edges.forEach(vueOpened => {
              const vue = createVueObj(vueOpened.node.vue, this.userObj);
              vue.cursor = vueOpened.cursor;
              vue.user_opened = true;
              vue.user_saved = vueOpened.node.saved;
              vue.special = vueOpened.node.special;

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
      componentProps: {vue: vue}
    });

    await modal.present();
  }

  ionViewDidLeave(){
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
