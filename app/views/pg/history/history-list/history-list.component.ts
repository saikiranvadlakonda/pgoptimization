import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { HistoryItem } from '../../../../shared/models/history/history-item.model';
import { HistoryService } from '../../../../shared/services/history/history.service';
import { Subscription } from 'rxjs/Subscription';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { Observable } from 'rxjs/Observable';
import { TocItemViewModel } from '../../../../shared/models/practiceAreas';
import { ContentService } from '../../../../shared/services/content/content.service';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { PgMessages } from '../../../../shared/constants/messages';
import { PagerService } from '../../../../shared/services/pager/pager.service';

@Component({
    selector: 'app-history-list',
    templateUrl: './history-list.component.html',
    styleUrls: ['./history-list.component.css'],
    providers: [ContentService]
})
export class HistoryListComponent implements OnInit, OnDestroy {
    historyItems: HistoryItem[];
    sortedList: HistoryItem[];
    timePeriods: string[] = [];
    searchHistory: string = "";
    rowCount: number = 5;
    sortBy: string;
    categoryBy: string = "0";
    practiceAreas: TocItemViewModel[];
    practiceArea: TocItemViewModel;
    private subscriptions: Subscription = new Subscription();
    routerState$: Observable<StateParams>;
    asc: boolean = false;
    searchText: string = "";
    showMore: boolean = false;
    lastHistorySize: number = 0;
    historySortBy: string[] = [];
    timePeriod: string = undefined;
    historyError: string;
    pgMessages: any = PgMessages.constants;

    constructor(private _dataStoreService: DataStoreService, private _routerProxy: RouterProxy, private _historyService: HistoryService, private _contentService: ContentService,
        private _pagerService: PagerService) {
    }

    ngOnInit() {
        this.historySortBy = ["Most Recent", "Today", "Yesterday", "Last Week", "Last Two Weeks", "Last Month", "Older"];
        this._historyService.getHistoryItemsByCount(this.rowCount).subscribe((history: any) => {
            if (history && history.length > 0 && history[0].isValid) {                                 
                this.historyItems = history;
                this.sortedList = history;
                this.lastHistorySize = this.sortedList.length - 1;
                this.timePeriods = this.removeDuplicates(this.historyItems, 'dateBadge');
                if (this.sortedList.length > 0) this.showMore = true;
                this.historyError = undefined;                
            } else {
                this.historyItems = [];
                this.sortedList = [];
                this.timePeriods = [];
                this.showMore = false;
                this.historyError = (Array.isArray(history) && history.length ==0) ? PgMessages.constants.history.noHistoryForCategory : PgMessages.constants.history.error;
            }
            this.scrollTop();
        });
        this.practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
    }

    removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }
    
    sortByPeriod(period: string) {
        this.rowCount = 5;
        this.timePeriod = period;
        this.getHistory(this.rowCount);       
    }

    getHistory(rowCount) {
        let input = {
            "paName": this.practiceArea == undefined ? "" : this.practiceArea.title,
            "numRecs": rowCount,
            "period": (this.timePeriod == undefined || this.timePeriod.toLowerCase() == 'Most Recent'.toLowerCase()) ? "" : this.timePeriod,
            "topicType": (this.practiceArea == undefined ? "" : this.practiceArea.type)
        };
        if (this.practiceArea != undefined && this.practiceArea.type == "PA-MD") {
            input.paName = input.paName.replace("Tax - ", "");
            input.paName = input.paName.replace("Real Estate - ", "").trim();
        }
        this._historyService.getHistoryItemsPaPeriodByCount(input).subscribe((history: any) => {
            if (history && history.length > 0 && history[0].isValid) {             
                    this.historyItems = history;
                    this.sortedList = history;
                    this.timePeriods = this.removeDuplicates(this.historyItems, 'dateBadge');
                    if (this.rowCount !== 5) {
                        if (this.lastHistorySize == this.sortedList.length - 1) this.showMore = false;
                        this.lastHistorySize = this.sortedList.length - 1;
                    }
                    this.lastHistorySize = this.sortedList.length - 1;
                    this.historyError = undefined;                
            } else {
                this.historyItems = [];
                this.sortedList = [];
                this.timePeriods = [];
                this.showMore = false;
                this.historyError = (Array.isArray(history) && history.length ==0) ? PgMessages.constants.history.noHistoryForCategory : PgMessages.constants.history.error;
            }
            this.scrollTop();
        });
    }

    practiceAreaChange(practiceArea: TocItemViewModel) {
        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", practiceArea);
        this.practiceArea = practiceArea;
        this.searchText = "";
        this.rowCount = 5;
        this.getHistory(this.rowCount);
    }

    getAllHistory() {
        this.practiceArea = undefined;
        this.rowCount = 5;        
        this.getHistory(this.rowCount);       
    }
    
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }    

    loadMoreHistItems() {
        this.rowCount += 5;
        this.getHistory(this.rowCount);       
    }

    showLessHistItems() {
        this.showMore = true;
        this.sortedList = this.sortedList.slice(0, 5);
        this.rowCount = 5;
    }

    navigateToHistory(history) {
       this._contentService.navigateToContent(history);
    }

    scrollTop() {
        this._pagerService.setPageView();        
    }  

    getPracticeAreaName(history: HistoryItem) {
        let practiceArea = this.practiceAreas.find(pa => history.domainPath.includes(pa.domainPath));
        if (practiceArea != undefined) {
            return practiceArea.title;
        } else {
            return history.lmtTitlePath.split("|")[2];
        }
    }
}
