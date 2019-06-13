import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError } from 'rxjs/operators';
import { PgConstants } from '../../constants/pg.constants';
import { UserViewModel } from '../../models/user/user.model';
import { FeedbackModel } from '../../models/user/feedback.model';


@Injectable()
export class UserService {


    constructor(private http: HttpClient) { }

    getUserInfo() {
        return this.http.get<UserViewModel>(PgConstants.constants.WEBAPIURLS.GetUserInfo)
            .pipe(
                timeout(300000),
                catchError((error: Response) => Observable.throw(error))
            );
    };

    submitFeedback(input) {
        return this.http.post(PgConstants.constants.WEBAPIURLS.SendFeedback, input, {
            withCredentials: false
        }).pipe(
            timeout(300000),
            catchError((error: Response) => Observable.throw(error))
        );
    }
}