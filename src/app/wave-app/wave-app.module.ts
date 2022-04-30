import { NgModule } from '@angular/core';
import { WaveAppPageRoutingModule } from './wave-app-routing.module';
import { SharedModule } from '../shared/shared.module';

import { WaveAppPage } from './wave-app.page';

@NgModule({
  imports: [
    SharedModule,
    WaveAppPageRoutingModule
  ],
  declarations: [WaveAppPage]
})
export class WaveAppPageModule {}
