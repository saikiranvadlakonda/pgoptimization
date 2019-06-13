import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { SearchService } from '../../../../shared/services/search/search-service';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { SearchModel } from '../../../../shared/models/search';
import { Subscription } from 'rxjs/Subscription';
import { SearchParameters } from '../../../../shared/models/search/searchParameter.model';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { Observable } from 'rxjs/Observable';
import { PagerService } from '../../../../shared/services/pager/pager.service';
import { ContentService } from '../../../../shared/services/content/content.service';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FoldersService } from '../../../../shared/services/folders/folders.service';
import { CreateFolerViewModel } from '../../../../shared/models/Repository/Create.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { SearchResultModel } from '../../../../shared/models/search';
import { CompileDirective } from '../../../../shared/directives/compile.directive';
import { PracticeAreaSearchComponent } from '../../../../shared/components/practice-area-search/practice-area-search.component';
import { WhatsNewService } from '../../../../shared/services/whats-new/whats-new.service';
import { SafePipe } from '../../../../shared/pipes/safe/safe.pipe';
import { PgMessages } from '../../../../shared/constants/messages';
import {ContentViewRequest} from "../../../../shared/models/analytics/contentViewRequest.model";
import {ContentViewReqService} from "../../../../shared/services/analytics/content-view-req.service";

@Component({
    selector: 'app-search-result',
    templateUrl: './search-result.component.html',
    styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, OnDestroy {
    isCollapsed = true;
    @ViewChild(CompileDirective) compile: CompileDirective;
    private subscriptions: Subscription = new Subscription();
    searchParams: SearchParameters = new SearchParameters();
    routerState$: Observable<StateParams>;
    @ViewChild(PracticeAreaSearchComponent) searchInput: PracticeAreaSearchComponent;
    @ViewChild('modalContentAlert') modalContentAlert: TemplateRef<any>; modalAlertRef: BsModalRef;
    constructor(
        private _routerProxy: RouterProxy,
        private _navigationService: NavigationService,
        private _searchService: SearchService,
        private _pagerService: PagerService,
        private _contentService: ContentService,
        private modalService: BsModalService,
        private _foldersService: FoldersService,
        private _dataStoreService: DataStoreService,
        private _whatsNewService: WhatsNewService,
        private _contentViewReqService: ContentViewReqService) {

        this.routerState$ = this._routerProxy.getRouterState();
    }
    isPDF = false; pdfContent: any; pdfTitle: string = "";
    searchResults: SearchModel;
    // pager object
    pager: any = {};

    // paged items
    pagedItems: any[];
    renderContentRequest: RenderContentRequest = new RenderContentRequest();
    contentHTML: string;
    isSubContent: boolean = false;
    modalRef: BsModalRef;
    @ViewChild('modalContent') modalContent: TemplateRef<any>;
    viewModel;
    saveFolderTitle;
    checkedResults;
    loadFolders: boolean = false;
    saveToFolderContent;
    error: string;
    pgMessages: any = PgMessages.constants;

    ngOnInit() {
        const stateSubscription = this.routerState$.subscribe((state) => {
            if (state) {
                try {
                    if ((!state.viewModel || state.viewModel) && !state.viewModel.SearchTerm) {
                        let prevState = this._navigationService.getStateByRouteName(PgConstants.constants.URLS.Header2.SearchResults);
                        if (prevState != undefined) {
                            state.viewModel = prevState.previousRouteStateParams.viewModel;
                        }
                    }
                } catch (e) {

                }
                
                (window.document.getElementById("searchTextInput") as HTMLInputElement).value = state.viewModel.SearchTerm;
                this.searchParams = state.viewModel;
                this.getSeachResults(state.viewModel);
                this.scrollTop();
            }
        });

        this.subscriptions.add(stateSubscription);
    }

    setPage(page: number) {
        if (page < 1 || page > (this.pager.totalPages == 0 ? 1 : this.pager.totalPages)) {
            return;
        }

        // get pager object from service

        this.pager = this._pagerService.getPager(+this.searchResults.resultSet.totalHits, page, this.searchParams.Size);
        // get current page of items
        this.pagedItems = this.searchResults.searchResults;
        //.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }

    getSeachResults(params) {
        this._searchService.getSearchResults(params).subscribe((results: any) => {
            if (results && results.isValid) {
                this.searchResults = results;
                if (results.navigationEntries.length > 0) {
                    this._dataStoreService.setSessionStorageItem("practiceAreaPrefilters", results.navigationEntries.find(f => f.name == 'practicearea').navigationElements);
                    this._dataStoreService.setSessionStorageItem("topicPrefilters", results.navigationEntries.find(f => f.name == 'subtopic').navigationElements);
                    this._dataStoreService.setSessionStorageItem("docPrefilters", results.navigationEntries.find(f => f.name == 'lndocumenttypes').navigationElements);
                }
                this.error = (results.searchResults.length == 0) ? PgMessages.constants.searchResult.noResults : undefined;
            } else {
                let searchResults: SearchModel;
                this.searchResults = searchResults;
                this.error = PgMessages.constants.searchResult.error;
            }
            // initialize to page 1
            this.setPage(params.PageNumber + 1);
        });
    }

    onPageSizeChange(size: number) {
        this.searchParams = { ...this.searchParams, Size: size, PageNumber: 0 };
        this.setSearchParams();
    }

    onSortChange(value: number) {
        this.searchParams = { ...this.searchParams, Sort: value == 1 ? false : value == 2 ? true : false, PageNumber: 0 };
        this.setSearchParams();
    }

    onPageChange(pageNumber: number) {
        this.scrollTop();//window.scrollTo(0, 0);
        this.searchParams = { ...this.searchParams, PageNumber: pageNumber - 1 };
        this.setSearchParams();
    }
    practiceAreaClick(filters: string) {
        this.searchParams = { ...this.searchParams, Filters: filters, PageNumber: 0 };
        this.setSearchParams();
    }
    topicClick(filters: string) {
        this.searchParams = { ...this.searchParams, Filters: filters, PageNumber: 0 }
        this.setSearchParams();
    }

    subTopicClick(filters: string) {
        this.searchParams = { ...this.searchParams, Filters: filters, PageNumber: 0 }
        this.setSearchParams();
    }
    documentTypeClick(filters: string) {
        this.searchParams = { ...this.searchParams, Filters: filters, PageNumber: 0 }
        this.setSearchParams();
    }
    narrowSearchClick(narrowSearchTerms: any) {
        this.searchParams = { ...this.searchParams, NarrowSearchTerms: narrowSearchTerms.narrowSearchTerms, OriginalNarrowSearchTerm: narrowSearchTerms.originalNarrowText }
        this.setSearchParams();
    }

    setSearchParams() {
        //this._routerProxy.dispatchRouterAction(PgConstants.constants.URLS.Header2.SearchResults, new StateParams(this.searchParams));
        this.getOnlySearchResults(this.searchParams);
    }

    ngOnDestroy() {
        var ind = <HTMLInputElement>document.querySelector("input.filterInputForm");
        ind.value = "";
        //this.searchInput.searchTerm = "";
        this.subscriptions.unsubscribe();
    }

    onSearchResultClick(clickedItem: any) {
        const result = clickedItem.result;

        const docTypes = [];
        docTypes.push(result.lnDocumentTypes);
    
        const titlepath = result.lmtTitlePath.split("|");
        const itemTitle =  titlepath[titlepath.length -1];
    
        let contentViewReq: ContentViewRequest = {
            documentTypes: docTypes,
            primarySearchRecordRank: clickedItem.pagerank,
            correlationId: this.searchResults.searchCorrelationId,
            domainPath: result.lmtIDPath,
            domainTitle: itemTitle,
            primarySearchDisplayTitle: itemTitle
        };
        this._contentViewReqService.logSearchContentViewRequest(contentViewReq).subscribe(() => {});
              
        var dPath = result.lmtIDPath;
        if (result.lnDocumentTypes.toLowerCase() == "news" ||
            result.lnDocumentTypes.toLowerCase() == "breaking news" ||
            result.lnDocumentTypes.toLowerCase() == "recent cases") {

            if (dPath.indexOf("zb/") != 0 && dPath.indexOf("zb/") == -1) {
                dPath = "zb/" + dPath;
            }
            this._whatsNewService.findNewsItemContentType({ domainPath: dPath }).subscribe(data => {
                if (data.isPdf) {
                    window.open(data.link);
                } else {
                    this.displayContent(dPath, result);
                }
            });
            //handleNewsRouting
        } else if (result.lnDocumentTypes.toLowerCase() == "guidance") {
            var pathLen = 7;

            if (dPath.toLowerCase().indexOf("b2ioc") > -1 || dPath.toLowerCase().indexOf("nor6d") > -1) {
                pathLen = 8;
            }
            if (dPath.split('/').length > pathLen) {
                dPath = dPath.substring(0, dPath.lastIndexOf('/'));
            } else {
                dPath = dPath;
            }
            if (dPath.indexOf("zb/") != 0 && dPath.indexOf("zb/") == -1) {
                dPath = "zb/" + dPath;
            }
            result.lmtIDPath = dPath;
            if (result.lmtTitlePath.indexOf("PGS|") == 0) {
                if (result.lmtIDPath.split("/").length == 8) {
                    result.lmtIDPath = result.lmtIDPath.split("/", 7).join("/");
                }
            }
            this.renderContentRequest.searchTerms = (window.document.getElementById("searchTextInput") as HTMLInputElement).value;

            this._contentService.navigateToContent(result);
            //this._contentService.downloadContent(this.renderContentRequest).subscribe(data => {
            //    this.contentHTML = this._contentService.buildHtml(data.src);
            //    this.contentHTML = this.contentHTML.replace("<br />", ``);
            //    this.isSubContent = true;
            //});
        } else {
            if (dPath.indexOf("zb/") != 0 && dPath.indexOf("zb/") == -1) {
                dPath = "zb/" + dPath;
            }
            if (dPath.toLowerCase().indexOf("b2ioc") > -1 || dPath.toLowerCase().indexOf("nor6d") > -1) {
                var subtopicLength;

                if (result.practiceArea.toLowerCase() === "income tax")
                    subtopicLength = 6;
                else
                    subtopicLength = 5;
                if (dPath.split('/').length === subtopicLength && dPath.indexOf("a2ioc") !== -1) {
                    var subTopicDPath = dPath.substring(0, dPath.lastIndexOf('/'));
                    this.displayContent(subTopicDPath, result);
                } else {
                    this.displayContent(dPath, result);
                }

            } else {
                this.displayContent(dPath, result);
            }
        }

    }
    buildNewHTML(input: string): string {
        var regex1 = new RegExp(`onclick="javascript:window.parent.parent.addTab[(]'Loading...','PGS/ContentView.aspx[?]dpath[=]`);
        var regex2 = new RegExp(`onclick="javascript:window.parent.parent.addTab[(]'Loading...', 'Library/ContentView.aspx[?]dpath[=]`);
        var regex3 = new RegExp(`src[=]"/Content/ContentResponse.aspx[?]dpath[=]`);
        input = input.replace(new RegExp(regex1, 'g'), `(click)="openDContent('`);
        input = input.replace(new RegExp(regex2, 'g'), `(click)="openDContent('`);
        input = input.replace(new RegExp(`href="#`, 'g'), `class="underLine`);
        // input = input.replace(new RegExp('[^\u0000-\u007F]', 'g'), ' ');
        input = input.replace(new RegExp('.jpg"', 'g'), `.jpg'"`);
        input = input.replace(new RegExp(regex3, 'g'), `[image-src]="'`);
        input = input.replace(new RegExp('.JPG"', 'g'), `.JPG'"`);
        input = input.replace(new RegExp('.png"', 'g'), `.png'"`);
        return input;
    }
    openDContent(domainPath: string) {
        if (domainPath.indexOf('#') !== -1)
            domainPath = domainPath.split('#')[0];
        this.downloadContent(domainPath, "false");
    }

    openLContent(domainPath: string) {
        var splitArray = domainPath.split('/');
        domainPath = splitArray[splitArray.length - 1];
        this.downloadContent(domainPath, "false");
    }

    openMVContent(dpath: string, hasChildren: string) {
        this.downloadContent(dpath.split('#')[0], hasChildren);
    }

    downloadContent(dpath, hasChildren) {
        var rendRequest = new RenderContentRequest();
        rendRequest.dpath = dpath;
        rendRequest.hasChildren = hasChildren

        this._contentService.downloadContent(rendRequest).subscribe((content: any) => {

            if (content && content.isValid) {
                if (content.mimeType == "text/html") {
                    this.contentHTML = content.fileStrContent;
                    this.contentHTML = this.buildNewHTML(this.contentHTML);
                    this.contentHTML = this.contentHTML.replace("<br />", ``);
                    this.isSubContent = true;
                    if (this.compile) {
                        this.compile.compile = this.contentHTML;
                        this.compile.compileContext = this;
                        this.compile.compRef.changeDetectorRef.detectChanges();
                        this.compile.ngOnChanges();
                    }

                    this.pdfTitle = (content.fileName ? (content.fileName.replace(content.fileExtension, '')) : '');
                } else
                    this._contentService.downloadattachment(content.fileContent, content.fileName, content.mimeType);
            } else {
                this.contentHTML = content.fileStrContent;
                this.contentHTML = this.buildNewHTML(this.contentHTML);
                this.contentHTML = this.contentHTML.replace("<br />", ``);
                this.isSubContent = true;
                if (this.compile) {
                    this.compile.compile = this.contentHTML;
                    this.compile.compileContext = this;
                    this.compile.compRef.changeDetectorRef.detectChanges();
                    this.compile.ngOnChanges();
                }

            }
        });


    }

    showFolderModal(modal) {
        if (this.checkedResults && this.checkedResults.length > 0)
            this.openModal(modal);
        else
            //alert('Please make a selection');
            this.modalAlertRef = this.modalService.show(this.modalContentAlert, { backdrop: 'static', keyboard: false });
    }

    openModal(template: TemplateRef<any>) {
        this.getFoldersAll(template);
    }

    folderInfo;
    selectedMainFolder;
    selectedSubsciberClientId;
    mainFolder;
    selFolder;
    getFoldersAll(template) {
        var content = { "title": "", "url": "", "searchResult": this.checkedResults };
        if (this.checkedResults && this.checkedResults.length > 0) {
            var fileTitle = "";
            this.checkedResults.forEach(cR => {
                var title = "";
                title = cR.title.replace(new RegExp(`<span class='SearchHIT'>`, 'g'), "");
                title = title.replace(new RegExp(`</span>`, 'g'), "");
                fileTitle += (title + ", ");
            });
            fileTitle = fileTitle.replace(/,\s*$/, '');
            content.title = fileTitle.trim();
        }
        this.saveToFolderContent = JSON.parse(JSON.stringify(content));
        this.loadFolders = true;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false });
    }

    onParentFolderSelect(subscriberClientId) {
        this.selectedSubsciberClientId = subscriberClientId;
        this.selectedMainFolder = this.folderInfo.find(f => f.subscriberClientId == subscriberClientId);
        this.mainFolder = {
            "zoneId": this.selectedMainFolder.zoneId,
            "subscriberId": this.selectedMainFolder.subscriberId,
            "subscriberClientId": this.selectedMainFolder.subscriberClientId,
            "lastAccessedDate": this.selectedMainFolder.lastAccessedDate,
            "dateCreated": this.selectedMainFolder.dateCreated,
            "clientDescription": this.selectedMainFolder.clientDescription,
            "isSelected": false
        };
    }

    onSaveToFolderClick(folder) {
        this.selFolder = folder;
        this.SaveFile();
    }

    SaveFile() {
        if (this.selFolder) {
            this.checkedResults.forEach(r => {
                var createFolder = new CreateFolerViewModel();
                createFolder.subscriberClientId = this.selFolder.subscriberClientID;
                createFolder.folderID = this.selFolder.folderNameID;
                createFolder.url = r.lmtIDPath;
                r.title = r.title.replace(new RegExp(`<span class='SearchHIT'>`, 'g'), "");
                r.title = r.title.replace(new RegExp(`</span>`, 'g'), "");
                createFolder.title = r.title;

                this._foldersService.CreateDocument(createFolder).subscribe(data => {
                    this.modalRef.hide();
                });
            });
        }
        else
            //alert("Please select a folder");
            this.modalAlertRef = this.modalService.show(this.modalContentAlert, { backdrop: 'static', keyboard: false });
    }

    onSearchResultChecked(result) {
        this.checkedResults = result;
    }

    onPopUpCloseClick() {
        this.modalRef.hide();
    }

    getOnlySearchResults(params) {
        this._searchService.getSearchResults(params).subscribe(data => {
            this.searchResults = data;
            //this._dataStoreService.setSessionStorageItem("practiceAreaPrefilters", data.navigationEntries.find(f => f.name == 'practicearea').navigationElements);
            // initialize to page 1
            this.setPage(params.PageNumber + 1);
        });
    }

    displayContent(dPath, result) {
        var rendRequest = new RenderContentRequest();
        rendRequest.dpath = dPath;
        rendRequest.hasChildren = "false";
        rendRequest.fromPage = "Search";
        rendRequest.searchTerms = (window.document.getElementById("searchTextInput") as HTMLInputElement).value;

        this._contentService.downloadContent(rendRequest).subscribe(data => {
            if (data.mimeType == "text/html") {
                this.contentHTML = data.fileStrContent;//this._contentService.buildHtml((data.fileStrContent));
                this.contentHTML = this.buildNewHTML(this.contentHTML);
                this.contentHTML = this.contentHTML.replace("<br />", ``);
                this.isSubContent = true;
                this.isPDF = false;
                this.scrollTop();//window.scrollTo(0, 0);
                this.pdfTitle = (data.fileName ? (data.fileName.replace(data.fileExtension, '')) : '');
                if (this.compile != undefined) {
                    this.compile.compile = this.contentHTML;
                    this.compile.compileContext = this;
                    this.compile.compRef.changeDetectorRef.detectChanges();
                    this.compile.ngOnChanges();
                }
            }
            else {
                if (data.mimeType == "application/pdf") {
                    this.isPDF = true;
                    this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + rendRequest.dpath.split("/").pop();
                    this.pdfTitle = data.fileName;
                    this.scrollTop();//window.scrollTo(0, 0);
                } else {
                    this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
                }

            }
        });
    }

    back() {
        this.isPDF = this.isPDF ? !this.isPDF : this.isPDF;
        this.isSubContent = this.isSubContent ? !this.isSubContent : this.isSubContent;
    }

    scrollTop() {
        let scrollEle = document.getElementById('newpg');
        if (/msie\s|trident\/|edge\//i.test(window.navigator.userAgent)) {
            if (this._pagerService.mobiView) {
                window.scrollTo(0,0);
            }else
            scrollEle.scrollTop = 0;
        }
        else {
            if (this._pagerService.mobiView) {
                window.scrollTo(0, 0);
            }else
            scrollEle.scrollTo(0, 0);
        }
    }

    collapseSearch() {
        this.isCollapsed = !this.isCollapsed;
    }

    doOrigonalSearch(insteadSearch) {
        this.searchParams.SearchTerm = insteadSearch;
        var ind = <HTMLInputElement>document.querySelector("input.filterInputForm");
        ind.value = insteadSearch;
        this.setSearchParams();
    }

    doDidYouMeanSearch() {
    }
}
