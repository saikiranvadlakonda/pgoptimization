import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError, share } from 'rxjs/operators';
import { PgConstants } from '../../constants/pg.constants';
import { NewGroupEntity, NewItemEntity } from '../../../shared/models/whats-new/new-group.model';



@Injectable()
export class WhatsNewService {

    constructor(private http: HttpClient) { }

    public getWhatsNew(input): Observable<NewItemEntity[]> {
        return this.http.post<NewGroupEntity[]>(PgConstants.constants.WEBAPIURLS.GetWhatsNew, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                share(),
                catchError((error: Response) => Observable.throw(error))
            );
    }
    public getAllWhatsNew(input): Observable<NewItemEntity[]> {
        return this.http.post<NewGroupEntity[]>(PgConstants.constants.WEBAPIURLS.GetAllWhatsNew, input, { withCredentials: false })
            .pipe(
            timeout(300000),
            share(),
            catchError((error: Response) => Observable.throw(error))
            );
    }

    public getAllLatestWhatsNew(input): Observable<NewItemEntity[]> {
        return this.http.post<NewGroupEntity[]>(PgConstants.constants.WEBAPIURLS.GetAllLatestWhatsNew, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                share(),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    public findNewsItemContentType(input): Observable<NewItemEntity> {
        return this.http.post<NewItemEntity>(PgConstants.constants.WEBAPIURLS.FindNewsItemContentType, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                share(),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    public getWhatsNewDetail(input): Observable<any> {
        return this.http.post<NewItemEntity>(PgConstants.constants.WEBAPIURLS.GetWhatsNewDetail, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                share(),
                catchError((error: Response) => Observable.throw(error))
            );
    }

    public findSubscribedNews(input): Observable<any> {
        return this.http.post<NewItemEntity>(PgConstants.constants.WEBAPIURLS.FindSubscribedNews, input, { withCredentials: false })
            .pipe(
                timeout(300000),
                share(),
                catchError((error: Response) => Observable.throw(error))
            );
    }

}
