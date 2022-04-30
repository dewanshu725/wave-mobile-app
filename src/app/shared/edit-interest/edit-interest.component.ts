import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { ERROR_MESSAGE } from 'src/app/helpers/constents';
import { INTEREST_KEYWORD_MUTATION } from 'src/app/helpers/graphql.query';
import { INTEREST_CATEGORY, INTEREST_KEYWORD } from 'src/app/helpers/models';
import { AppDataShareService } from 'src/app/services/app-data-share.service';
import { GraphqlService } from 'src/app/services/graphql.service';
import { IonicControllerService } from 'src/app/services/ionic-controller.service';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-edit-interest',
  templateUrl: './edit-interest.component.html',
  styleUrls: ['./edit-interest.component.scss'],
})
export class EditInterestComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private graphqlService: GraphqlService,
    private userDataService:UserDataService,
    private appDataShareService:AppDataShareService,
    private ionicControllerService: IonicControllerService
  ) { }

  allInterestCategory:INTEREST_CATEGORY[];
  studentInterest:INTEREST_KEYWORD[] = [];
  interestSelectionCounter = 0;
  interestChanged = false;
  InterestSaving = false;

  async ngOnInit() {
    const userData = await this.userDataService.getItem({interestCategory:true});
    this.allInterestCategory = userData.interestCategory;
    this.studentInterest = this.appDataShareService.studentInterest;
    this.interestSelectionCounter = this.studentInterest.length;
  }

  interestClicked(interest:INTEREST_KEYWORD){
    this.interestChanged = true;

    if (!interest.selected){
      interest.selected = true;
      interest.saved = true;
      this.interestSelectionCounter++;

      const index = this.studentInterest.findIndex(obj => obj.id === interest.id);
      if (index > -1) {
        this.studentInterest[index].saved = true;
      }
      else{
        this.studentInterest.push(interest);
      }
    }
    else{
      interest.selected = false;
      interest.saved = false;
      this.interestSelectionCounter--;

      const index = this.studentInterest.findIndex(obj => obj.id === interest.id);
      if (index > -1) {
        this.studentInterest[index].saved = false;
      }
    }
  }

  async saveInterest(){
    this.InterestSaving = true;
    const selectedInterestIds:string[] = [];
    this.studentInterest.forEach(interest => {
      if (interest.saved){
        selectedInterestIds.push(interest.id);
      }
    });

    const mutationArrgs = {
      selectedInterests: selectedInterestIds
    };

    const tokenStatus = await this.graphqlService.isTokenValid();

    if (tokenStatus){
      this.graphqlService.graphqlMutation(INTEREST_KEYWORD_MUTATION, mutationArrgs).pipe(take(1))
      .subscribe(
        async (result:any) => {
          if (result.data?.interestKeywordMutation?.result === true){

            const all_interest_category:INTEREST_CATEGORY[] = [];
            this.allInterestCategory.forEach(interest_category => {

              const interest_keyword_set:INTEREST_KEYWORD[] = [];
              interest_category.interest_keyword.forEach(interest => {
                let selected = false;
                this.studentInterest.forEach(selected_interest => {
                  if (selected_interest.id === interest.id && selected_interest.saved){
                    selected = true;
                  }
                });

                interest_keyword_set.push(
                  {
                    id:interest.id,
                    name:interest.name,
                    selected:selected,
                    saved:selected
                  }
                );

              });

              all_interest_category.push(
                {
                  name:interest_category.name,
                  interest_keyword:interest_keyword_set
                }
              );
  
            });

            await this.userDataService.setItem({interestCategory:JSON.stringify(all_interest_category)});
            this.appDataShareService.studentInterest = this.studentInterest;
            this.appDataShareService.currentSelectedInterestChanged.next([]);
            this.ionicControllerService.simpleToast(ERROR_MESSAGE.interest_saved);
            this.closeModal();
          }
          else{
            this.InterestSaving = false;
            this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
          }
        },
        error => {
          this.InterestSaving = false;
          this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
        }
      );
    }
    else{
      this.InterestSaving = false;
      this.ionicControllerService.simpleToast(ERROR_MESSAGE.unknown_error);
    }
  }

  closeModal(){
    this.modalController.dismiss();
  }

}
