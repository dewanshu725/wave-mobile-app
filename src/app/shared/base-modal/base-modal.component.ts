import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-base-modal',
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.scss'],
})
export class BaseModalComponent implements OnInit {

  constructor() { }

  showContent = false;

  rootComponent: any;
  rootParams: any;

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.showContent = true;
  }

}
