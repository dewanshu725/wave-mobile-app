import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'wave-app',
    pathMatch: 'full'
  },
  {
    path: 'account',
    canActivate: [LoginGuard],
    loadChildren: () => import('./account/account.module').then( m => m.AccountPageModule)
  },
  {
    path: 'wave-app',
    canActivate: [AuthGuard],
    loadChildren: () => import('./wave-app/wave-app.module').then( m => m.WaveAppPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
