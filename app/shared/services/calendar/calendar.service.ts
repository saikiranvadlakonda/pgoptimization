import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError } from 'rxjs/operators';
import { PgConstants } from '../../constants/pg.constants';


@Injectable()
export class CalendarService {

    constructor(private http: HttpClient) { }

    getCalendarEvents(zoneId: number, startDate: string, endDate: string, eventTypeCode: string): Observable<any> {
        var data = { 'zoneId': zoneId, 'startDate': startDate, 'endDate': endDate, 'eventTypeCode': eventTypeCode };
        return this.http.post(PgConstants.constants.WEBAPIURLS.GetCalendarEvents, data, { withCredentials: false })
            .pipe(
            timeout(300000),
            catchError((error: Response) => {
                return Observable.throw(error);
            })
            );
    }
}