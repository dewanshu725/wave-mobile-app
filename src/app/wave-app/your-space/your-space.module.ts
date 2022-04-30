import { NgModule } from '@angular/core';
import { YourSpacePageRoutingModule } from './your-space-routing.module';

import { YourSpacePage } from './your-space.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    YourSpacePageRoutingModule
  ],
  declarations: [YourSpacePage]
})
export class YourSpacePageModule {}
