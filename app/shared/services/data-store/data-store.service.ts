import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { SearchParameters } from '../../../shared/models/search';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataStoreService {

    constructor() { }

    public setSessionStorageItem(name: string, data: any) {

        sessionStorage.setItem(name, JSON.stringify(data));
    }

    public getSessionStorageItem(name: string): any {
        let item = sessionStorage.getItem(name);
        if (item) {
            item = JSON.parse(item);
        }
        return item;
    }

    public clearSessionStorageItem(name: string) {
        sessionStorage.removeItem(name);
    }

    public clearSessionStorage(): void {
        sessionStorage.clear();
    }

    private subject = new BehaviorSubject<SearchParameters>({
        Filters: null, PageNumber: 0,
        QueryString: null,
        SearchTerm: null,
        Size: 10,
        Sort: false,
        SearchPreFilters: '',
        NarrowSearchTerms: '',
        OriginalNarrowSearchTerm:''
    });

    getSearchParamter$: Observable<SearchParameters> = this.subject.asObservable();

    setSearchParamter(param: SearchParameters) {
        this.subject.next(param);
    }

}
