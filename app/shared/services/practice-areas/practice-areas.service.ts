import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError, share } from 'rxjs/operators';
import { TocItemViewModel, SubTocItemViewModel } from '../../models/practiceAreas'
import { PgConstants } from '../../constants/pg.constants';



@Injectable()
export class PracticeAreaService {

    constructor(private http: HttpClient) { }

    public getPracticeAreas(): Observable<TocItemViewModel[]> {
        let input = {};
        let res=this.http.post<TocItemViewModel[]>(PgConstants.constants.WEBAPIURLS.GetPracticeAreas, input, { withCredentials: false })
            .pipe(
            timeout(300000),
            share(),
            catchError((error: Response) => {
                let eRes = Observable.throw(error);
                return eRes;
            })
        );
        return res;
    }
    public getPracticeAreasOnly(): Observable<TocItemViewModel[]> {
        let input = {};
        return this.http.post<TocItemViewModel[]>(PgConstants.constants.WEBAPIURLS.GetPracticeAreasOnly, input, { withCredentials: false })
            .pipe(
            timeout(300000),
            share(),
            catchError((error: Response) => Observable.throw(error))
            );
    }
    public getIntroByDomainID(input): Observable<TocItemViewModel> {
        //let input = {};
        return this.http.post<TocItemViewModel>(PgConstants.constants.WEBAPIURLS.GetIntroByDomainID, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                share(),
                catchError((error: Response) => Observable.throw(error))
            );
    }
}
