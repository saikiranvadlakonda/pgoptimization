import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError, tap, shareReplay } from 'rxjs/operators';
import { PgConstants } from '../../constants/pg.constants';
import { CustomEncoder } from '../custom-encoder/custom-encoder';
import { DataStoreService } from '../data-store/data-store.service';
import { UserViewModel } from '../../models/user/user.model';
import { UserService } from '../user/user.service';
import { TokenModel } from '../../models/token/token.model';
import { PagerService } from '../pager/pager.service';

@Injectable()
export class AuthService {
    // Store authentication data
    tokenModel: TokenModel = new TokenModel();
    userProfile: UserViewModel = new UserViewModel();
    isLoggedOut: boolean = false;

    constructor(private http: HttpClient,
        private _dataStoreService: DataStoreService,
        private _userService: UserService,
        private _pagerService: PagerService) {

    }


    login(userName, password) {
        let body = new HttpParams({ encoder: new CustomEncoder() })
            .set('username', userName)
            .set('password', password);
        let subscriberId = this._dataStoreService.getSessionStorageItem("subscriberId");
        let subscriberClientId = this._dataStoreService.getSessionStorageItem("subscriberClientId");
        if (subscriberId != null) {
            body = body.set("username", userName)
                .set("subscriberId", subscriberId)
                .set("subscriberClientId", subscriberClientId);
        }
        const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        return this.http.post<TokenModel>(PgConstants.constants.WEBAPIURLS.Authenticate, body, { headers: httpHeaders })
            .pipe(
                shareReplay(),
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    }


    getUserInfo() {
        return this._userService.getUserInfo();
    }

    get isLoggedIn(): boolean {
        this.tokenModel = this._dataStoreService.getSessionStorageItem("userToken");
        this.userProfile = this._dataStoreService.getSessionStorageItem("userInfo");
        /*if (window.location.href.lastIndexOf("logout") != -1 || window.location.href.indexOf("permalink-view") != -1) {
            //this.userProfile.isAuthenticated = false;
            this.isLoggedOut = true;
            return false;
        }*/
        // Check if current date is before token
        // expiration and user is signed in locally
        if (this.tokenModel != null && this.userProfile != null) {
            var shouldLogout = this._dataStoreService.getSessionStorageItem("logout");
            if (shouldLogout != null) {
                return false;
            }

            //return Date.now() < this.tokenModel.expiresAt && this.userProfile.isAuthenticated;
            return this.userProfile.isAuthenticated;
        } else if (this.tokenModel != null) {
            return true;
        }
    }



    get loggedInUserName(): string {
        this.userProfile = this._dataStoreService.getSessionStorageItem("userInfo");
        if (this.userProfile != null) {
            return this.userProfile.userName;
        }
    }


    logout() {
        const httpHeaders = new HttpHeaders().append('Content-Type', 'application/x-www-form-urlencoded').append('Accept', 'text/html');
        return this.http.post(PgConstants.constants.WEBAPIURLS.Logout, null, { headers: httpHeaders }).subscribe((response: any) => {
            if (response) {
                this._dataStoreService.clearSessionStorage();
                this.isLoggedOut = true;
                if (response.url) {
                    if (!this._pagerService.mobiView)
                    window.parent.postMessage("logout", response.url);
                    window.location.href = response.url;
                } else {
                    window.location.href = "www.mylexisnexis.co.za";
                }
            }
        });
    }

    redirectedToLibrary() {
        return this.http.get(PgConstants.constants.WEBAPIURLS.RedirectToLib).pipe(
            shareReplay(),
            timeout(300000),
            catchError((error: Response) => Observable.throw(error))
        );
    }
}