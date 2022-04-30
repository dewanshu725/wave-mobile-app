import { NgModule } from '@angular/core';
import { YourVuePageRoutingModule } from './your-vue-routing.module';

import { YourVuePage } from './your-vue.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    YourVuePageRoutingModule
  ],
  declarations: [YourVuePage]
})
export class YourVuePageModule {}
