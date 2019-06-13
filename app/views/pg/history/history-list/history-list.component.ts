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
        //this.routerState$ = this._routerProxy.getRouterState();
    }

    ngOnInit() {

        this.historySortBy = ["Most Recent", "Today", "Yesterday", "Last Week", "Last Two Weeks", "Last Month", "Older"];
        this._historyService.getHistoryItemsByCount(this.rowCount).subscribe((history: any) => {
            if (history && history.length > 0) {
                if (history[0].isValid) {
                    //history.forEach(hItem => {
                    //    if (hItem.lmtTitlePath) {
                    //        let titlePath = hItem.lmtTitlePath;
                    //        hItem.lmtTitlePath = (titlePath.split('|')).length > 3 ? titlePath.split('|')[2] : titlePath.split('|')[1];
                    //        if (titlePath.includes("Income Tax")) {
                    //            hItem.lmtTitlePath = "Tax - " + hItem.lmtTitlePath;
                    //        } else if (titlePath.includes("Real Estate")) {
                    //            hItem.lmtTitlePath = "Real Estate - " + hItem.lmtTitlePath;
                    //        }
                    //    }
                    //});
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
                    this.historyError = PgMessages.constants.history.error;
                }
            } else {
                this.historyItems = [];
                this.sortedList = [];
                this.timePeriods = [];
                this.showMore = false;
                this.historyError = (Array.isArray(history)) ? PgMessages.constants.history.noHistoryForCategory : PgMessages.constants.history.error;
            }
            this.scrollTop();//window.scrollTo(0, 0);
        });

        this.practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
    }

    removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }

    onSortChange(value) {
        this.sortBy = value;
        this.updateSortNCategory();

    }

    sort() {
        this.asc = !this.asc;
        var sortColumn = (this.asc) ? "formatedDatePublished" : "-formatedDatePublished";
        this.sortedList = this.transform(this.sortedList, sortColumn);
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
            if (history && history.length > 0) {
                if (history[0].isValid) {
                    //history.forEach(hItem => {
                    //    if (hItem.lmtTitlePath) {
                    //        let titlePath = hItem.lmtTitlePath;
                    //        hItem.lmtTitlePath = (titlePath.split('|')).length > 3 ? titlePath.split('|')[2] : titlePath.split('|')[1];
                    //        if (titlePath.includes("Income Tax")) {
                    //            hItem.lmtTitlePath = "Tax - " + hItem.lmtTitlePath ;
                    //        } else if (titlePath.includes("Real Estate")) {
                    //            hItem.lmtTitlePath = "Real Estate - " + hItem.lmtTitlePath ;
                    //        }
                    //    }
                    //});
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
                    this.historyError = PgMessages.constants.history.error;
                }
            } else {
                this.historyItems = [];
                this.sortedList = [];
                this.timePeriods = [];
                this.showMore = false;
                this.historyError = (Array.isArray(history)) ? PgMessages.constants.history.noHistoryForCategory : PgMessages.constants.history.error;
            }
            this.scrollTop();//window.scrollTo(0, 0);
        });

    }

    getHistoryByPeriod(period) {
        let input = {
            "paName": this.practiceArea == undefined ? "" : this.practiceArea.title, "numRecs": this.rowCount, "period": period, "topicType": (this.practiceArea == undefined ? "" : this.practiceArea.type)
        };
        this._historyService.getHistoryItemsPaPeriodByCount(input).subscribe((history: any) => {
            if (history && history.length > 0) {
                if (history[0].isValid) {
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
                    this.historyError = PgMessages.constants.history.error;
                }
            } else {
                this.historyItems = [];
                this.sortedList = [];
                this.timePeriods = [];
                this.showMore = false;
                this.historyError = (Array.isArray(history)) ? PgMessages.constants.history.noHistoryForCategory : PgMessages.constants.history.error;
            }
            this.scrollTop();//window.scrollTo(0, 0);
        });
    }
    onCategoryChange(value) {
        this.categoryBy = value;
        this.updateSortNCategory();
    }

    practiceAreaChange(practiceArea: TocItemViewModel) {
        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", practiceArea);
        this.practiceArea = practiceArea;
        this.searchText = "";
        this.rowCount = 5;
        //this.getHistoryByPA(practiceArea);//
        this.getHistory(this.rowCount);
        //this.getAllHistory();

        /* PO
        this.pageIndex = 0;
            this.practiceArea = practiceArea;
            this.pageSize = 5;
            this.searchText = "";
            this._dataStoreService.setSessionStorageItem("WhatsNews", null);
            this.getSelectedWhatsNew();
        
        */
    }
    transform(array: Array<any>, args: string): Array<any> {
        if (typeof args[0] === "undefined") {
            return array;
        }
        let direction = args[0][0];
        let column = args.replace('-', '');
        array.sort((a: any, b: any) => {
            let left = Number(new Date(a[column]));
            let right = Number(new Date(b[column]));
            return (direction === "-") ? right - left : left - right;
        });
        return array;
    }

    updateSortNCategory() {
        var value = this.sortBy;
        var historyList = this.historyItems;

        var sortedList = [];
        if (value == "1") {
            //sort Most Recent
            historyList.sort((history1, history2) => {
                if (history1.date < history2.date) return 1;
                else if (history1.date > history2.date) return -1;
                else return 0;

                //return history1.name > history2.name ? 0 : 1;
            });
        } else if (value == "2") {
            //sort based on Name
            historyList.sort((history1, history2) => {
                if (history1.name < history2.name) return -1;
                else if (history1.name > history2.name) return 1;
                else return 0;

                //return history1.name > history2.name ? 0 : 1;
            });
        }

        if (this.categoryBy != "0")
            historyList = historyList.filter((historyItem) => {
                if (historyItem.lmtTitlePath.toLocaleLowerCase() == this.categoryBy.toLocaleLowerCase()) {
                    return historyItem;
                } else {

                }
            });

        this.sortedList = historyList;
    }
    getAllHistory() {
        this.practiceArea = undefined;
        this.rowCount = 5;        
        this.getHistory(this.rowCount);
        //if (this.timePeriod !==undefined && this.timePeriod.toLowerCase() !== 'Most Recent'.toLowerCase()) {
        //    this.getHistoryByPeriod(this.timePeriod);
        //}
        //else {            
        //        this._historyService.getHistoryItemsByCount(this.rowCount).subscribe(data => {
        //            this.historyItems = data;
        //            this.sortedList = data;
        //            this.timePeriods = this.removeDuplicates(this.historyItems, 'dateBadge');
        //            this.lastHistorySize = this.sortedList.length - 1;
        //            if (this.sortedList.length > 0) this.showMore = true;
        //            window.scrollTo(0, 0);
        //        });
        //}
    }

    //getAllPAsHistory() {
    //    this.practiceArea = undefined;        
    //    this._historyService.getHistoryItemsByCount(this.rowCount).subscribe(data => {
    //        this.historyItems = data;
    //        this.sortedList = data;
    //        this.timePeriods = this.removeDuplicates(this.historyItems, 'dateBadge');
    //        if (this.lastHistorySize == this.sortedList.length - 1) this.showMore = false;
    //        this.lastHistorySize = this.sortedList.length - 1;
    //        window.scrollTo(0, 0);
    //    });
    //}
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
    onScroll() {
        this.rowCount += 5;
        this.loadMoreHistItems();
    }


    loadMoreHistItems() {
        this.rowCount += 5;
        this.getHistory(this.rowCount);
        //if (this.practiceArea == undefined) {
        //    this.getAllPAsHistory();
            
        //} else {
        //if (this.timePeriod !== undefined && this.timePeriod.toLowerCase() !== 'Most Recent'.toLowerCase()) {
        //        this.getHistoryByPeriod(this.timePeriod);
        //    } else {
        //        this._historyService.getHistoryItemsByCount(this.rowCount).subscribe(data => {
        //            this.historyItems = data;
        //            this.sortedList = data;
        //            this.timePeriods = this.removeDuplicates(this.historyItems, 'dateBadge');
        //            if (this.lastHistorySize == this.sortedList.length - 1) this.showMore = false;
        //            this.lastHistorySize = this.sortedList.length - 1;
        //        });
        //    }            
        //}
 
    }

    showLessHistItems() {
        //if (this.sortedList.length > 10) this.sortedList = this.sortedList.slice(0, this.sortedList.length - 5);
        //if (this.sortedList.length <= 5) this.showMore = true; this.rowCount = 5;
        this.showMore = true;
        this.sortedList = this.sortedList.slice(0, 5);
        this.rowCount = 5;

    }

    navigateToHistory(history) {
       this._contentService.navigateToContent(history);
    }
    scrollTop() {
        this._pagerService.setPageView();
        /*
        let scrollEle = document.getElementById('newpg');
        if (window.navigator.userAgent.indexOf("Edge") == -1)
            scrollEle.scrollTo(0, 0);
        else
            scrollEle.scrollTop = 0;
        */
    }
    //getHistoryByPA(practiceArea: TocItemViewModel) {
    //    if (practiceArea != null && practiceArea.title != "") {
    //        if (this.timePeriod !== undefined && this.timePeriod.toLowerCase() !== 'Most Recent'.toLowerCase()) {
    //            this.getHistoryByPeriod(this.timePeriod);
    //        } else {
    //            this._historyService.getHistoryItemsPAByCount({ paName: practiceArea.title, numRecs: this.rowCount }).subscribe(data => {
    //                this.historyItems = data;
    //                this.sortedList = data;
    //                this.timePeriods = this.removeDuplicates(this.historyItems, 'dateBadge');
    //            });
    //        }
    //    }
    //}


    getPracticeAreaName(history: HistoryItem) {
        let practiceArea = this.practiceAreas.find(pa => history.domainPath.includes(pa.domainPath));
        if (practiceArea != undefined) {
            return practiceArea.title;
        } else {
            return history.lmtTitlePath.split("|")[2];
        }
    }
}
