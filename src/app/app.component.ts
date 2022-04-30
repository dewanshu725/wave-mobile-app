import { Component, OnDestroy, OnInit } from '@angular/core';
import { Network } from '@capacitor/network';
import { AppDataShareService } from './services/app-data-share.service';
import { IonicControllerService } from 'src/app/services/ionic-controller.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private appDataShareService: AppDataShareService,
    private ionicControllerService: IonicControllerService
  ) {}

  ngOnInit(){
    Network.addListener('networkStatusChange', status => {
      this.appDataShareService.networkStatusChanged.next(status.connected);

      if (!status.connected){
        this.ionicControllerService.noInternetToast();
      }
      else{
        this.ionicControllerService.backOnlineToast(status.connectionType);
      }
    });
  }

  ngOnDestroy(){
    Network.removeAllListeners();
  }
}
