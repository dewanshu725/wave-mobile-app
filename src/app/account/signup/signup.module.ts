import { NgModule } from '@angular/core';
import { SignupPageRoutingModule } from './signup-routing.module';

import { SignupPage } from './signup.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    SignupPageRoutingModule
  ],
  declarations: [SignupPage]
})
export class SignupPageModule {}
