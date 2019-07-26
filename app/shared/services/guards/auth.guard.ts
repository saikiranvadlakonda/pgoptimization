import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NavigationService } from '../navigation/navigation.service';
import { AuthService } from '../auth/auth.service';
import { SpinnerService } from '../../components/pg-spinner/pg-spinner.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private _router: Router,
    private _navigationService: NavigationService,
    private _authService: AuthService,
    private _spinnerService: SpinnerService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      this._spinnerService.hide();
    if (this._authService.isLoggedIn) {
      return true;
    }
    //window.location.href = "http://lngdurindd003.legal.regn.net:85";
      //window.location
    return false;
  }
}
