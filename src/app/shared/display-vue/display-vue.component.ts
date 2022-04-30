import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { truncate } from 'src/app/helpers/functions';
import { VUE } from 'src/app/helpers/models';
import { ImgErrhandlerDirective } from '../directive/img-errhandler.directive';

@Component({
  selector: 'app-display-vue',
  templateUrl: './display-vue.component.html',
  styleUrls: ['./display-vue.component.scss'],
})
export class DisplayVueComponent implements OnInit{

  constructor() { }

  @Input() vue:VUE;

  @Output() open = new EventEmitter();

  truncatedTitle:string;
  truncatedDescription:string;

  imgErrHandlerDirectiveInstance:ImgErrhandlerDirective = null;
  imgError = false;

  ngOnInit() {
    this.truncatedTitle = truncate(this.vue.title, 60);
    this.truncatedDescription = truncate(this.vue.description, 160);
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
}
