import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IonicControllerService {

  constructor(
    private toastController: ToastController
  ) { }

  private toast: HTMLIonToastElement;

  async simpleToast(message:string, duration=2000) {
    await this.dismissTost();

    this.toast = await this.toastController.create({
      message: message,
      duration: duration
    });

    this.toast.present();
  }

  async noInternetToast(){
    await this.dismissTost();

    this.toast = await this.toastController.create({
      message: 'No connection',
      buttons: [{
        text: 'OK',
        side: 'end',
      }],
      position: 'bottom',
      icon: 'alert-outline',
      color: 'medium',
      keyboardClose: true
    });

    this.toast.present();
  }

  async backOnlineToast(connectionType:string){
    await this.dismissTost();

    this.toast = await this.toastController.create({
      message: 'Back online',
      duration: 2000,
      position: 'bottom',
      icon: connectionType === 'cellular' ? 'cellular-outline' : 'wifi-outline',
      color: 'success'
    });

    this.toast.present();
  }

  async dismissTost(){
    try{
      await this.toast.dismiss();
    }
    catch{}
  }

}
