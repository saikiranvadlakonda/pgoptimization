import { Component, OnInit } from '@angular/core';
import { NewGroupEntity, NewItemEntity } from '../../../../shared/models/whats-new/new-group.model';
import { TocItemViewModel } from '../../../../shared/models/practiceAreas/tocItem.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { WhatsNewService } from '../../../../shared/services/whats-new/whats-new.service';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { PgModalService } from '../../../../shared/services/pg-modal/pg-modal.service';
import { Subscription } from 'rxjs/Subscription';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { Observable } from 'rxjs/Observable';
import { PgMessages } from '../../../../shared/constants/messages';

@Component({
    selector: 'app-whats-new',
    templateUrl: './whats-new.component.html',
    styleUrls: ['./whats-new.component.css']
})
export class WhatsNewComponent implements OnInit {
    private subscriptions: Subscription = new Subscription();
    routerState$: Observable<StateParams>;
    constructor(
        private _dataStoreService: DataStoreService,
        private _whatsNewService: WhatsNewService,
        private _navigationService: NavigationService,
        private _modalService: PgModalService,
        private _routerProxy: RouterProxy
    ) { this.routerState$ = this._routerProxy.getViewModel(); }
    practiceAreas: TocItemViewModel[];
    practiceArea: TocItemViewModel;
    whatsNew: NewGroupEntity[];
    newItems: NewItemEntity[];
    pageIndex: number = 0;
    pageSize: number = 5;
    searchText: string;
    asc: boolean = false;
    whatsNewCategories;
    isSubscribed: boolean = false;
    viewModel;
    lastPageSize: number = 0;
    showMore: boolean = true;
    paChange: boolean = true;
    whatsNewError: string;
    pgMessages: any = PgMessages.constants;

    ngOnInit() {
        this.practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
        const stateSubscription = this._routerProxy.getViewModel().subscribe((viewModel) => {
            if (viewModel) {
                this.viewModel = viewModel;
                if (this.viewModel.paTitle && this.viewModel.paTitle !== undefined) {
                    //  this.practiceArea = this.viewModel.title;
                    if (!this.practiceArea) {
                        //this.practiceArea = this.practiceAreas[0];
                        this.practiceAreas.forEach(pa => {
                            var paName = pa.title;
                            if (pa.title == viewModel.paTitle) {
                                this.practiceArea = pa;
                            }
                        });
                    }
                }
            }
        });

        this.subscriptions.add(stateSubscription);
        this.newItems = [];

        //window.scrollTo(0, 0);
        let scrollEle = document.getElementById('newpg');
        if (/msie\s|trident\/|edge\//i.test(window.navigator.userAgent))
            scrollEle.scrollTop = 0;
        else
            scrollEle.scrollTo(0, 0);
        //this.newItems = this._dataStoreService.getSessionStorageItem("WhatsNews");
        this.getSelectedWhatsNew();

    }

    getWhatsNew() {
        let input;
        if (this.practiceArea == undefined) {
            input = {
                "domainPath": "a2ioc", "tocItemType": "PA", "pageIndex": this.pageIndex, "pageSize": this.pageSize
            };
            this._whatsNewService.getAllLatestWhatsNew(input).subscribe((whatsNew: any) => {
                if (whatsNew && whatsNew.length > 0) {
                    if (whatsNew[0].isValid) {
                        this.newItems = [];
                        this._dataStoreService.setSessionStorageItem("WhatsNews", whatsNew);
                        for (var i = this.pageIndex; i < this.pageSize && whatsNew != undefined && whatsNew.length > 0; i++) {
                            if (whatsNew[i] !== undefined) {
                                this.newItems.push(whatsNew[i]);
                            }
                        }
                        this.practiceArea = undefined;
                        var newItemsSize = this.newItems.length - 1;
                        if (this.lastPageSize == newItemsSize && this.lastPageSize != 0) {
                            this.showMore = false;
                            this.pageSize = this.pageSize - 5;
                        } else {
                            this.lastPageSize = newItemsSize;
                        }
                        this.whatsNewError = undefined;
                    } else {
                        this.newItems = [];
                        this.whatsNewError = PgMessages.constants.whatsNew.error;
                        this.showMore = false;
                    }
                } else {
                    this.newItems = [];
                    this.whatsNewError = (Array.isArray(whatsNew)) ? PgMessages.constants.whatsNew.noWhatsNewForAppliedFilters : PgMessages.constants.whatsNew.error;
                    this.showMore = false;
                }
            });
        } else {
            input = {
                "domainPath": this.practiceArea.domainPath, "tocItemType": this.practiceArea.type, "pageIndex": this.pageIndex, "pageSize": this.pageSize
            };
            this._whatsNewService.getWhatsNew(input).subscribe((whatsNew: any) => {
                if (whatsNew && whatsNew.length > 0) {
                    if (whatsNew[0].isValid) {
                        this.newItems = [];
                        for (var i = this.pageIndex; i < this.pageSize && whatsNew != undefined && whatsNew.length > 0; i++) {
                            if (whatsNew[i] !== undefined) {

                                this.newItems.push(whatsNew[i]);
                            }
                        }
                        var newItemsSize = this.newItems.length - 1;
                        if (this.lastPageSize == newItemsSize && this.lastPageSize != 0) {
                            this.showMore = false;
                            this.pageSize = this.pageSize - 5;
                        } else {
                            this.lastPageSize = newItemsSize;
                        }
                        this.whatsNewError = undefined;
                    } else {
                        this.newItems = [];
                        this.whatsNewError = PgMessages.constants.whatsNew.error;
                        this.showMore = false;
                    }
                } else {
                    this.newItems = [];
                    this.whatsNewError = (Array.isArray(whatsNew)) ? PgMessages.constants.whatsNew.noWhatsNewForAppliedFilters : PgMessages.constants.whatsNew.error;
                    this.showMore = false;
                }
            });
        }
    }
    loadMore() {
        this.pageSize = this.pageSize + 5;
        this.getWhatsNew();
        this.paChange = false;
    }

    showLess() {
        this.newItems = this.newItems.slice(0, 5);
        this.paChange = false;
        this.showMore = true;
        this.pageIndex = 0;
        this.pageSize = 5;

    }
    practiceAreaChange(practiceArea: TocItemViewModel) {
        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", practiceArea);
        this.practiceArea = practiceArea;
        this.pageSize = 5;
       // this.searchText = "";
        this.paChange = true;
        this.showMore = true;
        this.lastPageSize = 0;
        this.getWhatsNew();
    }

    sort() {
        this.asc = !this.asc;
        var sortColumn = (this.asc) ? "formatedDatePublished" : "-formatedDatePublished";
        this.newItems = this.transform(this.newItems, sortColumn);
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

    isPgDomainPath(domainPath: string) {
        return (domainPath.indexOf('a2ioc') > -1 ? true : false);
    }

    isPgModule(domainPath: string) {
        return (domainPath.indexOf('b2ioc') > -1 || domainPath.indexOf('nor6d') > -1 ? true : false);
    }

    detailView(newItem) {

       
        var selectedPracticeArea = this.practiceAreas.find(nI => newItem.practiceAreaTitle == nI.title);
        var allPAs = this._dataStoreService.getSessionStorageItem("AllModulesPAs");

        if (this.isPgModule(newItem.domainPath)) {
            selectedPracticeArea = allPAs.find(nI => newItem.domainPath.split('/')[3] == nI.domainId);
        }
        
        newItem.disablePermalink = true;
        if (selectedPracticeArea.isSubscribed) {
            newItem.isValid = true;
            this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
            this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
            this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
        }
        else {
            newItem.isValid = false;
            this._whatsNewService.findSubscribedNews(newItem).subscribe(isSubscribed => {
                if (isSubscribed) {
                    this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
                    this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
                    this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
                } else {
                    this._modalService.open();
                }
            });
        }
    }

    showUnsubscribed(newsItem) {
        var selectedPracticeArea = this.practiceAreas.find(nI => newsItem.practiceAreaTitle == nI.title);
        if (selectedPracticeArea.isSubscribed || (newsItem.newsCategory.toLowerCase() == 'breaking news' || newsItem.newsCategory.toLowerCase() == 'opinion piece')) {
            this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
            this._dataStoreService.setSessionStorageItem("selectedNewItem", newsItem);
            this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
        }
        else
            this._modalService.open();
    }

    getSelectedWhatsNew() {
        if (this._dataStoreService.getSessionStorageItem("WhatsNews") !== null) {
            let data = this._dataStoreService.getSessionStorageItem("WhatsNews");
            this.newItems = [];
            if (data.length > 0) {
                for (var i = this.pageIndex; i < this.pageSize; i++) {
                    this.newItems.push(data[i]);
                }
            }

            this.whatsNewError = (this.newItems.length == 0) ? PgMessages.constants.whatsNew.noWhatsNewForAppliedFilters : undefined;
            return;
        }

        if (this.practiceArea == undefined)
            this.getAllWhatsNew();
        else {
            let input = {
                "domainPath": this.practiceArea.domainPath, "tocItemType": this.practiceArea.type, "pageIndex": this.pageIndex, "pageSize": 500
            };
            this._whatsNewService.getWhatsNew(input).subscribe((whatsNew: any) => {
                if (whatsNew && whatsNew.length > 0) {
                    if (whatsNew[0].isValid) {
                        this.newItems = [];
                        this._dataStoreService.setSessionStorageItem("WhatsNews", whatsNew);
                        for (var i = this.pageIndex; i < this.pageSize && whatsNew != undefined && whatsNew.length > 0; i++) {
                            this.newItems.push(whatsNew[i]);
                        }
                        this.newItems = [];
                        this.whatsNewError = undefined;
                    } else {
                        this.newItems = [];
                        this.whatsNewError = PgMessages.constants.whatsNew.error;
                    }
                } else {
                    this.newItems = [];
                    this.whatsNewError = (Array.isArray(whatsNew)) ? PgMessages.constants.whatsNew.noWhatsNewForAppliedFilters : PgMessages.constants.whatsNew.error;
                }
            });
        }
    }

    getSelectedWhatsNew1() {
        if (this.practiceArea == undefined) this.getAllWhatsNew();
        else {
            let input = {
                "domainPath": this.practiceArea.domainPath, "tocItemType": this.practiceArea.type, "pageIndex": this.pageIndex, "pageSize": 500
            };
            this._whatsNewService.getWhatsNew(input).subscribe(data => {
                this.newItems = [];
                this._dataStoreService.setSessionStorageItem("WhatsNews", data);
                for (var i = this.pageIndex; i < this.pageSize && data != undefined && data.length > 0; i++) {
                    this.newItems.push(data[i]);
                }
            });
        }


    }
    getAllWhatsNew() {
        let input = {
            "domainPath": "asdfsd/asdfs/a2ioc", "tocItemType": "PA", "pageIndex": 0, "pageSize": 5
        };
        this._whatsNewService.getAllLatestWhatsNew(input).subscribe((whatsNew: any) => {
            if (whatsNew && whatsNew.length > 0) {
                if (whatsNew[0].isValid) {
                    this.newItems = [];
                    this._dataStoreService.setSessionStorageItem("WhatsNews", whatsNew);
                    for (var i = this.pageIndex; i < this.pageSize; i++) {
                        this.newItems.push(whatsNew[i]);
                    }
                    this.whatsNewError = undefined;
                } else {
                    this.newItems = [];
                    this.whatsNewError = PgMessages.constants.whatsNew.error;
                }
            } else {
                this.newItems = [];
                this.whatsNewError = (Array.isArray(whatsNew)) ? PgMessages.constants.whatsNew.noWhatsNewForAppliedFilters : PgMessages.constants.whatsNew.error;
            }
        });
    }

    getAllWhatsNew1() {
        this.practiceArea = undefined;
        this.lastPageSize = 0;
        this.pageSize = 5;
        let input = {
            "domainPath": "asdfsd/asdfs/a2ioc", "tocItemType": "PA", "pageIndex": 0, "pageSize": 5
        };
        this._whatsNewService.getAllLatestWhatsNew(input).subscribe((whatsNew: any) => {
            if (whatsNew && whatsNew.length > 0) {
                if (whatsNew[0].isValid) {
                    this.newItems = [];
                    this._dataStoreService.setSessionStorageItem("WhatsNews", whatsNew);
                    for (var i = this.pageIndex; i < this.pageSize; i++) {
                        this.newItems.push(whatsNew[i]);
                    }
                    this.whatsNewError = undefined;
                } else {
                    this.newItems = [];
                    this.whatsNewError = PgMessages.constants.whatsNew.error;
                }
            } else {
                this.newItems = [];
                this.whatsNewError = (Array.isArray(whatsNew)) ? PgMessages.constants.whatsNew.noWhatsNewForAppliedFilters : PgMessages.constants.whatsNew.error;
            }
        });
    }

    isShowSubscribed(newsItem) {
        var selectedPracticeArea = this.practiceAreas.find(nI => newsItem.domainPath.includes(nI.domainPath));
        if (selectedPracticeArea.isSubscribed || (newsItem.newsCategory.toLowerCase() == 'breaking news' || newsItem.newsCategory.toLowerCase() == 'opinion piece')) {
            return true;
        } else {
            return false;
        }
    }


    openWhatsNewPdf(newItem) {
        if (this.isShowSubscribed(newItem)) {

            window.open(newItem.link, "_blank");
        } else {
            this._modalService.open();
        }
    }


}
