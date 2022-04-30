import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WaveAppPage } from './wave-app.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: WaveAppPage,
    children: [
      {
        path: 'vue-feed',
        loadChildren: () => import('./vue-feed/vue-feed.module').then( m => m.VueFeedPageModule)
      },
      {
        path: 'vue-history',
        loadChildren: () => import('./vue-history/vue-history.module').then( m => m.VueHistoryPageModule)
      },
      {
        path: 'vue-save',
        loadChildren: () => import('./vue-save/vue-save.module').then( m => m.VueSavePageModule)
      },
      {
        path: 'your-vue',
        loadChildren: () => import('./your-vue/your-vue.module').then( m => m.YourVuePageModule)
      },
      {
        path: 'your-space',
        loadChildren: () => import('./your-space/your-space.module').then( m => m.YourSpacePageModule)
      },
      {
        path: '',
        redirectTo: '/wave-app/tabs/vue-feed',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '',
    redirectTo: '/wave-app/tabs/vue-feed',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WaveAppPageRoutingModule {}
