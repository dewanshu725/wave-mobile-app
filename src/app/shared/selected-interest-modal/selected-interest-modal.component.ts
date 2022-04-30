import { Component, OnDestroy, OnInit } from '@angular/core';
import { INTEREST_KEYWORD } from 'src/app/helpers/models';
import { ModalController } from '@ionic/angular';
import { EditInterestComponent } from '../edit-interest/edit-interest.component';
import { AppDataShareService } from 'src/app/services/app-data-share.service';
import { IonicControllerService } from 'src/app/services/ionic-controller.service';
import { ERROR_MESSAGE } from 'src/app/helpers/constents';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-selected-interest-modal',
  templateUrl: './selected-interest-modal.component.html',
  styleUrls: ['./selected-interest-modal.component.scss'],
})
export class SelectedInterestModalComponent implements OnInit, OnDestroy {

  constructor(
    private modalController: ModalController,
    private appDataShareService: AppDataShareService,
    private ionicControllerService: IonicControllerService,

  ) { }

  destroy$: Subject<boolean> = new Subject<boolean>();

  studentInterest:INTEREST_KEYWORD[] = [];
  selectedInterest:INTEREST_KEYWORD[] = [];
  interestSelectedCounter = 0;

  ngOnInit() {
    this.interestSelectedCounter = this.selectedInterest.length;
    this.updateStudentInterest();

    this.appDataShareService.studentInterestChanged.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateStudentInterest());
  }

  updateStudentInterest(){
    let updatedStudentInterest:INTEREST_KEYWORD[] = [];

    this.appDataShareService.studentInterest.forEach(element => {
      const studentInterest:INTEREST_KEYWORD = {
        id:element.id,
        name:element.name,
        selected:false,
        saved: element.saved
      };

      const index = this.selectedInterest.findIndex(obj => obj.id === studentInterest.id);
      if (index > -1) {
        studentInterest.selected = true;
      }

      updatedStudentInterest.push(studentInterest);
    });

    this.studentInterest = updatedStudentInterest;
  }


  interestClicked(interest:INTEREST_KEYWORD){
    if (!interest.selected && this.interestSelectedCounter < 3){
      interest.selected = true;
      this.interestSelectedCounter++;
      this.selectedInterest.push(interest);
    }
    else if (!interest.selected && this.interestSelectedCounter === 3){
      this.ionicControllerService.simpleToast(ERROR_MESSAGE.interest_selection_error);
    }
    else{
      interest.selected = false;
      this.interestSelectedCounter--;

      const index = this.selectedInterest.findIndex(obj => obj.id === interest.id);
      if (index > -1) {
        this.selectedInterest.splice(index, 1);
      }
    }

    this.appDataShareService.currentSelectedInterestChanged.next(this.selectedInterest);
  }

  async presentModal(){
    //this.nav.push(EditInterestComponent);

    const modal = await this.modalController.create({
      component: EditInterestComponent,
    });

    await modal.present();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
