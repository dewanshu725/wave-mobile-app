import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateVuePage } from './create-vue.page';

const routes: Routes = [
  {
    path: '',
    component: CreateVuePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateVuePageRoutingModule {}
