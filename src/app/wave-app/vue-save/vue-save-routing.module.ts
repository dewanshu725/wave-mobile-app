import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VueSavePage } from './vue-save.page';

const routes: Routes = [
  {
    path: '',
    component: VueSavePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VueSavePageRoutingModule {}
