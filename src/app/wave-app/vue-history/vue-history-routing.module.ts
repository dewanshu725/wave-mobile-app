import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VueHistoryPage } from './vue-history.page';

const routes: Routes = [
  {
    path: '',
    component: VueHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VueHistoryPageRoutingModule {}
