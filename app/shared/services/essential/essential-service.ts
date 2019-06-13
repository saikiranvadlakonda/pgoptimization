import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError, share } from 'rxjs/operators';
import { Essential } from '../../models/essential'
import { PgConstants } from '../../constants/pg.constants';


@Injectable()
export class EssentialService {

    constructor(private http: HttpClient) { }

    public getAllEssential(input): Observable<Essential[]> {
        return this.http.post<any[]>(PgConstants.constants.WEBAPIURLS.GetAllEssential, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                share(),
                catchError((error: Response) => Observable.throw(error))
            );
    };

    public getEssential(input): Observable<Essential[]> {
        return this.http.post<any[]>(PgConstants.constants.WEBAPIURLS.GetEssential, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                share(),
                catchError((error: Response) => Observable.throw(error))
            );
    };

}
