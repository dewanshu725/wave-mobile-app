import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatIconModule} from '@angular/material/icon';
import {MatStepperModule} from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatRippleModule} from '@angular/material/core';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';


export const materialComponents = [
  MatIconModule,
  MatStepperModule,
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule,
  MatButtonModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatButtonToggleModule,
  MatRippleModule
];


@NgModule({
  declarations: [],
  providers: [
    //{provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ],
  imports: [
    CommonModule,
    materialComponents
  ],
  exports: [materialComponents]
})
export class MaterialModule { }
