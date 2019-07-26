import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError } from 'rxjs/operators';
import { PgConstants } from '../../constants/pg.constants';
import { HistoryItem } from '../../models/history/history-item.model';


@Injectable()
export class HistoryService {

    constructor(private http: HttpClient) { }

    getHistory(): Observable<HistoryItem[]> {
        return this.http.get(PgConstants.constants.WEBAPIURLS.GetHistoryItems, { withCredentials: false })
            .pipe(
            timeout(300000),
            catchError((error: Response) => Observable.throw(error))
            );
  }

  getHistoryItemsByCount(numRecords: number): Observable<HistoryItem[]> {
    return this.http.post(PgConstants.constants.WEBAPIURLS.GetHistoryItems, { numRecs: numRecords }, { withCredentials: false })
      .pipe(
        timeout(300000),
        catchError((error: Response) => Observable.throw(error))
      );
  }

  getAllHistoryItems(numRecords: number): Observable<HistoryItem[]> {
    return this.http.post(PgConstants.constants.WEBAPIURLS.GetAllHistoryItems, { numRecs: numRecords }, { withCredentials: false })
      .pipe(
        timeout(300000),
        catchError((error: Response) => Observable.throw(error))
      );
  }

    getHistoryItemsPAByCount(input: any): Observable<HistoryItem[]> {
        if (input.paName && input.numRecs>=0) {
            return this.http.post(PgConstants.constants.WEBAPIURLS.GetHistoryItemsByPA, input, { withCredentials: false })
                .pipe(
                    timeout(300000),
                    catchError((error: Response) => Observable.throw(error))
                );
        } else {
            return;
        }
        
    }

    getHistoryItemsPaPeriodByCount(input: any): Observable<HistoryItem[]> {
        //if (input.paName && input.numRecs >= 0 && input.period) {
        if (input.numRecs >= 0) {
            return this.http.post(PgConstants.constants.WEBAPIURLS.GetHistoryItemsByPaPeriod, input, { withCredentials: false })
                .pipe(
                    timeout(300000),
                    catchError((error: Response) => Observable.throw(error))
                );
        } else {
            return;
        }

    }
}
