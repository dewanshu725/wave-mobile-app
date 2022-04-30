import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { YourSpacePage } from './your-space.page';

const routes: Routes = [
  {
    path: '',
    component: YourSpacePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class YourSpacePageRoutingModule {}
