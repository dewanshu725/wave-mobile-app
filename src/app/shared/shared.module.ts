import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MaterialModule } from '../material.module';
import { SwiperModule } from 'swiper/angular';
import { HideHeaderDirective } from 'src/app/shared/directive/hide-header.directive';
import { BaseModalComponent } from './base-modal/base-modal.component';
import { SelectedInterestModalComponent } from './selected-interest-modal/selected-interest-modal.component';
import { EditInterestComponent } from './edit-interest/edit-interest.component';
import { DisplayVueComponent } from './display-vue/display-vue.component';
import { ImgErrhandlerDirective } from './directive/img-errhandler.directive';
import { AngularcdkModule } from '../angularcdk.module';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { DisplayDetailedVueComponent } from './display-detailed-vue/display-detailed-vue.component';
import { ReportVueComponent } from './report-vue/report-vue.component';



@NgModule({
  declarations: [
    HideHeaderDirective,
    BaseModalComponent,
    SelectedInterestModalComponent,
    EditInterestComponent,
    DisplayVueComponent,
    DisplayDetailedVueComponent,
    ReportVueComponent,
    ImgErrhandlerDirective
  ],

  entryComponents: [DisplayDetailedVueComponent, ReportVueComponent],

  imports: [
    CommonModule,
    IonicModule,
    SwiperModule,
    MaterialModule
  ],

  exports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SwiperModule,
    AngularcdkModule,
    VirtualScrollerModule,

    HideHeaderDirective,
    ImgErrhandlerDirective,

    DisplayVueComponent
  ]
})
export class SharedModule { }
