import { NgModule } from '@angular/core';
import { VueHistoryPageRoutingModule } from './vue-history-routing.module';

import { VueHistoryPage } from './vue-history.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    VueHistoryPageRoutingModule
  ],
  declarations: [VueHistoryPage]
})
export class VueHistoryPageModule {}
