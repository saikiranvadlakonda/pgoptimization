import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpHeaders,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { Location } from '@angular/common';
import { SpinnerService } from '../../components/pg-spinner/pg-spinner.service';
import { DataStoreService } from '../data-store/data-store.service';
import { TokenModel } from '../../models/token/token.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class PgInterceptor implements HttpInterceptor {
    defalutTimeout = 30000;
    _apiRequestPattern: RegExp[] = [
        new RegExp(/api\//i)
    ];
    tokenModel: TokenModel = new TokenModel();
    constructor(private _location: Location,
        private _spinnerService: SpinnerService,
        private _dataStoreService: DataStoreService,
        private _authService: AuthService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        //only show spinner for api calls
        this._spinnerService.show();
        if (window.parent)
            window.parent.postMessage("showBackdrop", "*");
        const appName = 'Practical Guidance';

        //TODO: Logging Helper

        let contentType = 'application/json';

        if (request.headers.has('Content-Type')) {
            contentType = request.headers.get('Content-Type');
        }
        this.tokenModel = this._dataStoreService.getSessionStorageItem('userToken');
        if (contentType !== 'application/x-www-form-urlencoded' && this.tokenModel != null) {
            let httpHeaders = new HttpHeaders()
                .append('x-vid', this._location.path())
                .append('app-name', appName)
                .append('Content-Type', contentType)
                .append('Authorization', 'Bearer ' + this.tokenModel.token);


            let authReq = request.clone({
                headers: httpHeaders
            });

            return next.handle(authReq)
                .catch(error => {
                    if (error instanceof HttpErrorResponse) {
                        var status = (<HttpErrorResponse>error).status;
                        if (status == 401) {
                            this._authService.logout();
                            return Observable.throw(error);
                        } else {
                            this.hideSpinner(error);
                            return Observable.throw(error);
                        }
                    } else {
                        return Observable.throw(error);
                    }
                })
                .do((responseEvent) => this.hideSpinner(responseEvent),
                    (erroEvent) => this.hideSpinner(erroEvent)
                );

        } else {
            return next.handle(request)
                .catch(error => {
                    if (error instanceof HttpErrorResponse) {
                        var status = (<HttpErrorResponse>error).status;
                        if (status == 401) {
                            this._authService.logout();
                            return Observable.throw(error);
                        } else {
                            this.hideSpinner(error);
                            return Observable.throw(error);
                        }
                    } else {
                        return Observable.throw(error);
                    }
                })
                .do((responseEvent) => this.hideSpinner(responseEvent),
                    (errorEvent) => this.hideSpinner(errorEvent));
        }
    }

    isValidApiRequest(url: string): boolean {
        //check if regex pattern is met and if it isnt an excluded route
        return this._apiRequestPattern.some(e => {
            return e.test(url);
        })
    }
    hideSpinner(event: any) {
        if (event instanceof HttpResponse && this.isValidApiRequest(event.url)) {
            //re enable the spinner after any http response
            this._spinnerService.spinnerDisabled = false;
            this._spinnerService.hide();
            if (window.parent)
                window.parent.postMessage("hideBackdrop", "*");
        } else if (event instanceof HttpErrorResponse || event.name === 'TimeoutError') {
            this._spinnerService.spinnerDisabled = false;
            this._spinnerService.hide(true);
            if (window.parent)
                window.parent.postMessage("hideBackdrop", "*");
        }

    }

}
