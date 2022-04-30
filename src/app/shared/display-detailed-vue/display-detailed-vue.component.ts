import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { REPORT_VUE, UPDATE_VUE_INTERACTION } from 'src/app/helpers/graphql.query';
import { REPORT, VUE } from 'src/app/helpers/models';
import { GraphqlService } from 'src/app/services/graphql.service';
import { ImgErrhandlerDirective } from '../directive/img-errhandler.directive';
import { AlertController } from '@ionic/angular';
import { IonicControllerService } from 'src/app/services/ionic-controller.service';
import { ERROR_MESSAGE } from 'src/app/helpers/constents';
import { Browser } from '@capacitor/browser';
import { ReportVueComponent } from '../report-vue/report-vue.component';
import { AppDataShareService } from 'src/app/services/app-data-share.service';

@Component({
  selector: 'app-display-detailed-vue',
  templateUrl: './display-detailed-vue.component.html',
  styleUrls: ['./display-detailed-vue.component.scss'],
})
export class DisplayDetailedVueComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private graphqlService: GraphqlService,
    private alertController: AlertController,
    private appDataShareService: AppDataShareService,
    private ionicControllerService: IonicControllerService
  ) { }


  vue:VUE;
  displaySavedFeed = false;

  imgErrHandlerDirectiveInstance:ImgErrhandlerDirective = null;
  imgError = false;
  loading = false;

  ngOnInit() {
    
  }


  reset(){
    this.imgErrHandlerDirectiveInstance = null;
    this.imgError = false;
  }

  onImgErr(instance:ImgErrhandlerDirective){
    this.imgErrHandlerDirectiveInstance = instance;
    this.imgError = true;
  }

  imgRetry(){
    if (this.imgErrHandlerDirectiveInstance != null){
      this.imgError = false;
      this.imgErrHandlerDirectiveInstance.reTry();
    }
  }

  closeModal(){
    this.modalController.dismiss(null);
  }

  async openUrl(){
    await Browser.open({ url: this.vue.url });
  }

  converseButton(container:HTMLDivElement){
    console.log(container.clientHeight);
  }

  vueInteraction(opened=false, saved=false): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      this.loading = true;

      const mutationArrgs = {
        vueId: this.vue.id,
        opened: opened,
        saved: saved,
        special: this.vue.special
      }

      this.graphqlService.graphqlMutation(UPDATE_VUE_INTERACTION, mutationArrgs).pipe(take(1)).subscribe(
        (result:any) => {
          if (result.data.updateVueInteraction.result){
            if (opened){
              this.vue.user_opened = true;
            }
            else if (saved){
              this.vue.user_saved = !this.vue.user_saved;
            }

            this.loading = false;
            return resolve(true);
          }
          else{
            this.loading = false;
            this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
            return resolve(false);
          }
        },
        error => {
          this.loading = false;
          this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
          return resolve(false);
        }
      );
    });
  }

  async removeAlert() {
    const alert = await this.alertController.create({
      mode: 'ios',
      cssClass: 'custom-ion-alert',
      translucent: true,
      header: 'Remove This Vue',
      message: 'This will  remove the vue from your saved vue list',
      buttons: [
        'Cancel', 
        {
          text: 'Okay',
          handler: async () => {
            const removeVue = await this.vueInteraction(false, true);
            if (removeVue){
              this.modalController.dismiss({'removeVue': this.vue.id});
            }
          }
        }
      ]
    });

    await alert.present();
  }


  async reportModel(){
    const modal = await this.modalController.create({
      mode: 'ios',
      showBackdrop: true,
      backdropDismiss: true,
      cssClass: 'custom-sheet-modal',
      component: ReportVueComponent
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data){
      this.reportVue(data.report);
    }
  }

  reportVue(report:REPORT){
    this.loading = true;

    const mutationArrgs = {
      vueId: this.vue.id,
      others: report.other,
      adultSite: report.adult,
      clickbait: report.clickbait,
      dangerous: report.dangerous,
      shoppingSite: report.shopping,
      gamblingSite: report.gambling,
      misleading: report.misleading
    }

    this.graphqlService.graphqlMutation(REPORT_VUE, mutationArrgs).pipe(take(1)).subscribe(
      (result:any) => {
        if (result.data.reportVue.result === true){
          this.appDataShareService.vueReported.next(this.vue.id);
          this.closeModal();
        }
        else{
          this.loading = false;
          this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
        }
      },
      error => {
        this.loading = false;
        this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
      }
    );
  }


}
