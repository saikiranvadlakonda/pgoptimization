import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { timeout, catchError, share } from 'rxjs/operators';
import { Essential, EssentialFilters } from '../../models/essential'
import { PgConstants } from '../../constants/pg.constants';


@Injectable()
export class EssentialService {

    constructor(private http: HttpClient) { }
    
    public getAllEssentialsByPage(input): Observable<Essential[]> {
        const params = { page: input.page, size: input.size, practiceAreaName: input.practiceAreaName };
        params.page = (params.page - 1);
        const body = input.topics;
        return this.http.post<any[]>(PgConstants.constants.WEBAPIURLS.GetAllEssentialsByPage, body, {
            withCredentials: false,
            params: params
        })
            .pipe(
                timeout(300000),
                share(),
                catchError((error: Response) => Observable.throw(error))
            );
    };

    //GetEssentialsCount
    public getEssentialsCount(input): Observable<EssentialFilters[]> {
        return this.http.post<any[]>(PgConstants.constants.WEBAPIURLS.GetEssentialsCount, {}, {
            withCredentials: false,
            params: input
        })
            .pipe(
                timeout(300000),
                share(),
                catchError((error: Response) => Observable.throw(error))
            );
    };

    public aggregateEssentials(filters: EssentialFilters[]) {
        let topics = {};
        let documentTypes = {};

        filters.forEach(filter => {
            if (topics[filter.topic] == undefined || topics[filter.topic] == null) {
                topics[filter.topic] = {};
                topics[filter.topic][filter.documentType] = filter.count;
                topics[filter.topic]['total'] = filter.count;
            } else {
                topics[filter.topic][filter.documentType] = filter.count;
                topics[filter.topic]['total'] += filter.count;
            }
            if (documentTypes[filter.documentType] == undefined || documentTypes[filter.documentType] == null) {
                documentTypes[filter.documentType] = filter.count;
            } else {
                documentTypes[filter.documentType] += filter.count;
            }
        });

        return {
            topics: topics, documentTypes: documentTypes
        };
    }
}
