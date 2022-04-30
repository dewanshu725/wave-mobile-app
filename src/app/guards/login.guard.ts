import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private authenticationService:AuthenticationService, private router: Router) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const authenticated = await this.authenticationService.isAuthenticated();
    if (authenticated) {
      this.router.navigateByUrl('/wave-app', {skipLocationChange: true});
      return false;
    }
    else{
      return true;
    }
  }
  
}
