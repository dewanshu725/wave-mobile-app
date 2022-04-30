import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { REPORT } from 'src/app/helpers/models';

@Component({
  selector: 'app-report-vue',
  templateUrl: './report-vue.component.html',
  styleUrls: ['./report-vue.component.scss'],
})
export class ReportVueComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  report:REPORT = {
    'misleading': false,
    'clickbait':false,
    'adult': false,
    'shopping': false,
    'gambling': false,
    'dangerous': false,
    'other': false
  }

  ngOnInit() {}

  isChecked(event){
    this.report[event.detail.value] = event.detail.checked;
  }

  submitReport(){
    if (
      this.report.misleading === true || 
      this.report.clickbait === true ||
      this.report.adult === true ||
      this.report.shopping === true ||
      this.report.gambling === true ||
      this.report.dangerous === true ||
      this.report.other === true
    ){
      this.modalController.dismiss({'report': this.report});
    }
    else{
      this.modalController.dismiss(null);
    }
  }
}
