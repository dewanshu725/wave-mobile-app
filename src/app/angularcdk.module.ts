import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScrollingModule } from '@angular/cdk/scrolling';


const CdkComponents = [
  ScrollingModule,
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CdkComponents
  ],
  exports: [CdkComponents]
})
export class AngularcdkModule { }
