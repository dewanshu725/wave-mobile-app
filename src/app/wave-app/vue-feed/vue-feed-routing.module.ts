import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VueFeedPage } from './vue-feed.page';

const routes: Routes = [
  {
    path: '',
    component: VueFeedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VueFeedPageRoutingModule {}
