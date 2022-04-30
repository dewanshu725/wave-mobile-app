import { NgModule } from '@angular/core';
import { VueFeedPageRoutingModule } from './vue-feed-routing.module';

import { VueFeedPage } from './vue-feed.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    VueFeedPageRoutingModule
  ],
  declarations: [VueFeedPage]
})
export class VueFeedPageModule {}
