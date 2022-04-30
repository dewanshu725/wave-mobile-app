import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { YourVuePage } from './your-vue.page';

const routes: Routes = [
  {
    path: '',
    component: YourVuePage
  },
  {
    path: 'create-vue',
    loadChildren: () => import('./create-vue/create-vue.module').then( m => m.CreateVuePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class YourVuePageRoutingModule {}
