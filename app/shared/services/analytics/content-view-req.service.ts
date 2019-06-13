import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError, share } from 'rxjs/operators';
import { TocItemViewModel, SubTocItemViewModel } from '../../models/practiceAreas'
import { PgConstants } from '../../constants/pg.constants';
import { ContentViewRequest} from '../../../shared/models/analytics/contentViewRequest.model';

@Injectable()
export class ContentViewReqService {

  constructor(private http: HttpClient) { }

  public logSearchContentViewRequest(input): Observable<any>{
    return this.http.post<ContentViewRequest>(PgConstants.constants.WEBAPIURLS.LogSearchContentViewRequest, input, {withCredentials: false})
      .pipe(
      timeout(300000),
      share(),
      catchError((error: Response) => {
          let eRes = Observable.throw(error);
          return eRes;
      })
    );
  }

}
