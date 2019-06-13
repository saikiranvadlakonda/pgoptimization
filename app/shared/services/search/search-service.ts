import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError, share } from 'rxjs/operators';
import { SearchModel } from '../../models/search'
import { PgConstants } from '../../constants/pg.constants';


@Injectable()
export class SearchService {
            
    constructor(private http: HttpClient) { }

    public getSearchResults(input): Observable<SearchModel> {
        
        return this.http.post<any[]>(PgConstants.constants.WEBAPIURLS.GetSearchResults, input, { withCredentials: false })
            .pipe(
            timeout(300000),
            share(),
            catchError((error: Response) => Observable.throw(error))
            );
    };

    public getSearchFilters(): Observable<any> {
        return this.http.post<any>(PgConstants.constants.WEBAPIURLS.GetSearchFilters, {}, {
            withCredentials: false
        }).pipe(
            timeout(300000),
            share(),
            catchError((error: Response) => Observable.throw(error))
        );
    }
}
