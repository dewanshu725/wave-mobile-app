import { NgModule } from '@angular/core';
import { VueSavePageRoutingModule } from './vue-save-routing.module';

import { VueSavePage } from './vue-save.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    VueSavePageRoutingModule
  ],
  declarations: [VueSavePage]
})
export class VueSavePageModule {}
