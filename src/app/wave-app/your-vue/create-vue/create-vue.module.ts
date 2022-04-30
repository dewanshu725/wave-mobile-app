import { NgModule } from '@angular/core';
import { CreateVuePageRoutingModule } from './create-vue-routing.module';

import { CreateVuePage } from './create-vue.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    CreateVuePageRoutingModule
  ],
  declarations: [CreateVuePage]
})
export class CreateVuePageModule {}
