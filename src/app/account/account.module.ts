import { NgModule } from '@angular/core';
import { AccountPageRoutingModule } from './account-routing.module';

import { AccountPage } from './account.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    AccountPageRoutingModule
  ],
  declarations: [AccountPage]
})
export class AccountPageModule {}
