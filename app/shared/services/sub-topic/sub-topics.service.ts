import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError, share } from 'rxjs/operators';

import { PgConstants } from '../../constants/pg.constants';



@Injectable()
export class SubTopicService {

    constructor(private http: HttpClient) { }

    public getHomeContentForPractiseArea(input): Observable<any> {

        var url = PgConstants.constants.WEBAPIURLS.GetHomeContentForPracticeArea;
        return this.http.post<any>(url, input, { withCredentials: false })
            .pipe(
            timeout(300000),
            catchError((error: Response) => Observable.throw(error))
            );
    };
}