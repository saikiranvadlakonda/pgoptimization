import { Component, NgZone, OnInit, OnDestroy, ViewChild, Input, ChangeDetectorRef, TemplateRef, AfterViewChecked, AfterViewInit, AfterContentInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { Observable } from 'rxjs/Observable';
import { ContentService } from '../../../../shared/services/content/content.service';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { Base64 } from 'js-base64';
import { CompileDirective } from '../../../../shared/directives/compile.directive';
import { ImageDirective } from '../../../../shared/directives/image.directive';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FoldersService } from '../../../../shared/services/folders/folders.service';
import { CreateFolerViewModel } from '../../../../shared/models/Repository/Create.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { EmailModalService } from '../../../../shared/services/email-modal/email-modal.service';
import { EssentialService } from '../../../../shared/services/essential/essential-service';
import { PgMessages } from '../../../../shared/constants/messages';
import { ErrorModalService } from '../../../../shared/services/error-modal/error-modal.service';
import { ErrorContent } from '../../../../shared/models/error-content/error-content.model';
import { PagerService } from '../../../../shared/services/pager/pager.service';
import { SafePipe } from '../../../../shared/pipes/safe/safe.pipe';
import { ContentSafePipe } from '../../../../shared/pipes/content-safe/content-safe.pipe';
import { SaveToFolderModalComponent } from '../../../../shared/components/save-to-folder-modal/save-to-folder-modal.component';
import { DownloadModalComponent } from '../../../../shared/components/download-modal/download-modal.component';
import { PermalinkModalComponent } from '../../../../shared/components/permalink-modal/permalink-modal.component';

@Component({
    selector: 'guidance-note-detail',
    templateUrl: './guidance-note-detail.component.html',
    styleUrls: ['./guidance-note-detail.component.css']
})

export class GuidanceNoteDetailComponent implements OnInit, AfterViewInit, AfterContentInit {
    @ViewChild(CompileDirective) compile: CompileDirective;
    @ViewChild(ImageDirective) imagesrc: ImageDirective;
    @ViewChild(SaveToFolderModalComponent) saveToFolderModalComponent: SaveToFolderModalComponent;
    @ViewChild(DownloadModalComponent) downloadModalComponent: DownloadModalComponent;
    @ViewChild(PermalinkModalComponent) permalinkModalComponent: PermalinkModalComponent;

    private subscriptions: Subscription = new Subscription();
    essentials;
    guidances;
    practiceArea: string = "";
    rootArea: string = "";
    isPDF: boolean = false;
    pdfTitle: string = "";
    pdfContent: string = "";
    guidanceDetail: string = "";
    guidanceHeader: string = "";
    authorNames: string = "";
    showGuidanceDetail: boolean = false;
    contentOutlinesList: any[] = [];
    saveToFolderContent: any;
    rendrContentRequest: RenderContentRequest = new RenderContentRequest();
    showGuidanceDetailChildContent: boolean = false;
    guidanceDetailChildContent: string = "";
    viewModel: any;
    domainId: string = ""; permaLink: string = "";
    isGuidanceNote: boolean = true;
    isMultiView: boolean = true;
    dPath = ''; jumpToID: string = "";
    guidanceDetailHistory = [];
    gnDetailObj: any;
    backButton: boolean = true;
    jumpToString: string = "";
    libContent: boolean = false;
    jumpDpath = "";
    pgConstants = PgConstants.constants;

    constructor(
        private _contentService: ContentService,
        private _routerProxy: RouterProxy,
        private _navigationService: NavigationService,
        private changeDetectorRef: ChangeDetectorRef,
        private _foldersService: FoldersService,
        private _dataStoreService: DataStoreService,
        private _router: Router,
        private _emailModalService: EmailModalService,
        private _essentialService: EssentialService,
        private _errorModalService: ErrorModalService,
        private _pageService: PagerService,
        private zone: NgZone,
    ) {
        window['angularComponentRef'] = {
            zone: this.zone,
            openLContent: (dpath) => this.openLContent(dpath),
            openDContent: (dpath) => this.openDContent(dpath),
            openMVContent: (dpath, isMultiView, event) => this.openMVContent(dpath, isMultiView, event),
            setFrameHeight: (scrollHeight, offsetHeight, clientHeight) => this.setFrameHeight(scrollHeight, offsetHeight, clientHeight),
            component: this,
        };
    }

    ngOnInit() {
        const stateSubscription = this._routerProxy.getViewModel().subscribe((guidancedetail) => {
            if (guidancedetail && guidancedetail != null) {
                this.guidances = this._dataStoreService.getSessionStorageItem("Guidances");
                if (guidancedetail && guidancedetail.domainPath == undefined) {
                    let state = this._navigationService.getStateByRouteName("guidance-note/guidance-note-detail");
                    if (state) {
                        guidancedetail = state.previousRouteStateParams.viewModel;
                    }

                }
                this.navigateToGuidanceDetails(guidancedetail, guidancedetail.hasChildren);
                this.domainId = guidancedetail.domainPath;
                this.essentials = guidancedetail.essentials;
                if (this.essentials == null || this.essentials == undefined) {
                    this.getEssentials([], "");
                }
                if (guidancedetail.fromLib && guidancedetail.fromLib == true) {
                    this.backButton = false;
                }
                this.isMultiView = guidancedetail.hasChildren;
                if (this.jumpToID) {
                    this.scroll(this.jumpToID);
                } else {
                    this.scrollTop();
                }
                this.gnDetailObj = guidancedetail;
            }
        });
        this.subscriptions.add(stateSubscription);
    }

    setFrameHeight(scrollHeight, offsetHeight, clientHeight) { }


    navigateToGuidanceDetails(guidancedetail, hasChild: string = "true") {
        if (guidancedetail.domainId == null && guidancedetail.domainPath != "") {
            var domainInd = guidancedetail.domainPath.split("/");
            guidancedetail.domainId = domainInd[domainInd.length - 1];
            if (guidancedetail.domainPath.indexOf("zb/") != 0) {
                guidancedetail.domainPath = "zb/" + guidancedetail.domainPath;
            }
        }
        this.viewModel = guidancedetail;
        this.rootArea = guidancedetail.practiceArea;
        this.rendrContentRequest.dpath = guidancedetail.domainPath;
        this.rendrContentRequest.hasChildren = hasChild;
        this.contentOutlinesList = [];
        this.guidanceHeader = this.viewModel.title;
        this.dPath = guidancedetail.domainPath;
        this._contentService.contentGuidanceDetails(this.rendrContentRequest).subscribe(data => {
            data = JSON.parse(data);

            if (this.guidances) {
                this.guidances.forEach((guidance, guidanceInd) => {
                    if (guidance.domainPath == guidancedetail.domainPath) {
                        this.guidanceHeader = guidance.title;
                        guidance.subContentDomains.forEach((subHeader, subHeadInd) => {
                            this.contentOutlinesList.push({ 'domainId': subHeader.domainId, 'title': (guidanceInd + 1) + "." + (subHeadInd + 1) + " " + subHeader.title });
                        });
                    }
                });

            }
            if (data !== null && data.fileStrContent != null && data.isValid) {
                this.guidanceDetail = data.fileStrContent;
                this.guidanceDetail = this.guidanceDetail.replace(this.guidanceHeader, "");
                this.showGuidanceDetail = true;
                this.authorNames = data.authorName;
                var historyData = {};
                historyData['guidanceHeader'] = this.guidanceHeader;
                historyData['authorNames'] = this.authorNames;
                historyData['dPath'] = this.dPath;
                historyData['contentOutlinesList'] = this.contentOutlinesList;
                historyData['essentials'] = this.essentials;
                historyData['isMultiView'] = this.isMultiView;
                historyData['guidanceDetail'] = this.guidanceDetail;
                if (guidancedetail.isKeySections) {
                    this.jumpToID = guidancedetail.jumpToID;
                }

                if (!this.dPath.startsWith('zb/a2ioc')) {
                    this.libContent = true;
                }
                if (guidancedetail.fromSearch) {
                    let self = this;
                    setTimeout(function () {
                        self.scroll("", document.evaluate("//p[contains(.,'" + guidancedetail.jumpString + "')]", document, null, XPathResult.ANY_TYPE, null).iterateNext());
                    }, 500);
                }
            } else {

            }
        });
    }

    hideGuidanceDetail() {
        this.showGuidanceDetail = false;
        this.showGuidanceDetailChildContent = false;
        this.guidanceHeader = "";
    }

    hideChildGuidanceDetail() {
        this.showGuidanceDetailChildContent = false;
    }

    getEssentials(essentialsList, eType) {
        if (this.essentials == null)
            this.essentials = [];
        essentialsList.forEach(e => {
            e.subContentDomains.forEach(el => {
                el.eType = eType;
                el.guidance = this.rootArea + ' > ' + this.practiceArea;
                this.essentials.push(el);
            });
        })

        var subTopics = [];
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");

        selectedPracticeArea.subTocItem.forEach(s => {
            subTopics.push(s);
        });

        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");

        let paName = selectedPracticeArea.title;
        if (selectedPracticeArea.type == "PA-MD") {
            paName = selectedPracticeArea.actualTitle;
        }
        this._essentialService.getEssentialsCount({ practiceAreaName: paName }).subscribe(allFilters => {
            let aggrFilters = this._essentialService.aggregateEssentials(allFilters);
            let topics;
            let documentType;

            if (aggrFilters.topics != undefined) {
                topics = Object.keys(aggrFilters.topics).map(topic => {
                    return { title: topic, isSelected: true, count: aggrFilters.topics[topic]['total'], topic: topic, isTopic: true, topicData: aggrFilters.topics[topic] };
                });
            }

            if (aggrFilters.documentTypes != undefined) {
                documentType = Object.keys(aggrFilters.documentTypes).map(docTitle => {
                    return { title: docTitle, isSelected: true, count: aggrFilters.documentTypes[docTitle], isTopic: false, topic: docTitle };
                });
            }

            this._essentialService.getAllEssentialsByPage({ topics: topics.concat(documentType), page: 1, size: 5, practiceAreaName: paName }).subscribe((essentials) => {
                if (essentials && essentials.length > 0) {
                    if (essentials[0].isValid) {
                        this.essentials = essentials;
                    } else {
                        this.essentials = [];
                    }
                } else {
                    this.essentials = [];
                }

            });
        });
        
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    openLContent(domainPath: string) {
        this.jumpDpath = domainPath;
        var splitArray = domainPath.split('/');
        domainPath = splitArray[splitArray.length - 1]; this.isMultiView = false;
        this.downloadContent(domainPath, "false");
    }
    openMVContent(dpath: string, hasChildren: string, linkTitle: any) {
        this.jumpDpath = dpath;
        if (hasChildren.toLocaleLowerCase() == "true") {
            this.isMultiView = true;
        } else {
            this.isMultiView = false;
        }
        try {
            if (typeof linkTitle == 'string') {
                tText = linkTitle;
                if (tText != null && tText != undefined && tText != "") {
                    if (tText.toLocaleLowerCase().indexOf("guidance note:") != -1) {
                        this.isGuidanceNote = true;
                        (this.openGuidanceDetail(dpath.split('#')[0], hasChildren));
                    } else {
                        (this.downloadContent(dpath.split('#')[0], hasChildren));
                        this.isGuidanceNote = false;
                    }
                }
            }
            if (event) {
                var tText = (event.currentTarget as HTMLElement).innerText;
                this.jumpToString = tText;
                if (tText != null && tText != undefined && tText != "") {
                    if (tText.toLocaleLowerCase().indexOf("guidance note:") != -1) {
                        this.isGuidanceNote = true;
                        (this.openGuidanceDetail(dpath.split('#')[0], hasChildren));
                    } else {
                        (this.downloadContent(dpath.split('#')[0], hasChildren));
                        this.isGuidanceNote = false;
                    }
                }
            }
        } catch (e) {
            this.downloadContent(dpath.split('#')[0], hasChildren);
        }
    }

    openDContent(domainPath: string) {
        this.jumpDpath = domainPath;
        try {
            var tText = (event.currentTarget as HTMLElement).innerText;
            if (tText != null && tText != undefined && tText != "") {
                if (tText.toLocaleLowerCase().indexOf("guidance note:") != -1) {
                }
                else {
                    this.isGuidanceNote = false;
                }
            }
            if (domainPath.indexOf('#') !== -1)
                domainPath = domainPath.split('#')[0];
            this.isMultiView = false;
            this.downloadContent(domainPath, "false");
        }
        catch (e) {
            if (domainPath.indexOf('#') !== -1)
                domainPath = domainPath.split('#')[0];
            this.isMultiView = false;
            this.downloadContent(domainPath, "false");
        }
    }

    downloadContent(dpath, hasChildren) {
        var rendRequest = new RenderContentRequest();
        rendRequest.dpath = dpath;
        rendRequest.hasChildren = hasChildren
        this.guidanceDetailChildContent = null;
        this.showGuidanceDetailChildContent = false;
        var historyData = {};
        historyData['guidanceHeader'] = this.guidanceHeader;
        historyData['authorNames'] = this.authorNames;
        historyData['dPath'] = this.dPath;
        historyData['contentOutlinesList'] = this.contentOutlinesList;
        historyData['essentials'] = this.essentials;
        historyData['isMultiView'] = this.isMultiView;
        historyData['guidanceDetail'] = this.guidanceDetail;
        historyData['jumpToString'] = this.jumpToString;
        historyData['jumpDpath'] = this.jumpDpath;
        this.guidanceDetailHistory.push(historyData);
        this.domainId = dpath;
        this.dPath = dpath;
        this._contentService.downloadContent(rendRequest).subscribe((content: any) => {
            if (content && content != null && content.isValid) {
                if (content.mimeType == "text/html") {
                    this.backButton = true;
                    this.guidanceDetailChildContent = content.fileStrContent;
                    this.guidanceDetail = this.guidanceDetailChildContent;
                    this.essentials = [];
                    this.contentOutlinesList = [];
                    var title = "";
                    if (content.fileName != null) {
                        title = content.fileName.replace(content.fileExtension, "");
                        this.guidanceHeader = title;
                    }
                    if (content.authorName) {
                        this.authorNames = content.authorName;
                    } else {
                        this.authorNames = "";
                    }
                    if (this.compile) {
                        this.compile.compile = this.guidanceDetailChildContent;
                        this.compile.compileContext = this;
                        this.compile.compRef.changeDetectorRef.detectChanges();
                        this.compile.ngOnChanges();
                    }
                    this.dPath = dpath;
                    if (this.jumpToID) {
                        this.scroll(this.jumpToID);
                    } else {
                        window.scrollTo(0, 0);
                    }
                    if (!this.dPath.startsWith("zb/a2ioc")) {
                        this.libContent = true;
                    }
                } else if (content.mimeType == "application/pdf" && !this._pageService.isMobile) {
                    this.isPDF = true;
                    this.pdfTitle = content.fileName.replace(".pdf", '');
                    this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + rendRequest.dpath.split("/").pop();
                    this.guidanceDetailHistory.pop();
                    this.scrollTop();
                } else {
                    this._contentService.downloadattachment(content.fileContent, content.fileName, content.mimeType);
                    this.guidanceDetailHistory.pop();
                }
            } else {
                this.backButton = true;
                this.guidanceDetailChildContent = content.fileStrContent;
                this.guidanceDetail = this.guidanceDetailChildContent;

                if (content.fileName != null) {
                    this.guidanceHeader = content.fileName.replace(content.fileExtension, "");
                }
                if (content.authorName) {
                    this.authorNames = content.authorName;
                } else {
                    this.authorNames = "";
                }
                if (this.compile) {
                    this.compile.compile = this.guidanceDetailChildContent;
                    this.compile.compileContext = this;
                    this.compile.compRef.changeDetectorRef.detectChanges();
                    this.compile.ngOnChanges();
                }
                this.dPath = dpath;
                if (this.jumpToID) {
                    this.scroll(this.jumpToID);
                } else {
                    this.scrollTop();
                }
            }
        });
    }

    downloadEssentials(data) {
        this.rendrContentRequest.dpath = data.domainPath;
        this.rendrContentRequest.hasChildren = (data.hasChildren) ? "true" : "false";
        this._contentService.downloadContent(this.rendrContentRequest).subscribe(data => {
            if (data.mimeType == "application/pdf" && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                this.isPDF = true;
                this.pdfTitle = data.fileName.replace(".pdf", '');
                this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + this.rendrContentRequest.dpath.split("/").pop();
                this.scrollTop();
            } else {
                this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
            }
        });
    }

    loadContentView(subContent) {
        this.navigateToGuidanceDetails(subContent.domainPath, subContent.hasChildren);
    }

    back() {
        let self = this;
        let previous = this._navigationService.getPreviousRoute();
        if (previous && previous.previousRoute && (previous.previousRoute.startsWith('/permalink-view')
            || previous.previousRoute.startsWith('/login'))) {
            this.backButton = false;
        }
        if (this.guidanceDetailHistory && this.guidanceDetailHistory.length > 0) {
            if (this.guidanceDetailHistory.length == 1) {
                this.libContent = false;
                this.isGuidanceNote = true;
                this.isPDF = false;
            }

            var guidanceData = this.guidanceDetailHistory.pop();
            this.guidanceHeader = guidanceData.guidanceHeader;
            this.guidanceDetail = guidanceData.guidanceDetail;
            this.authorNames = guidanceData.authorNames;
            this.contentOutlinesList = guidanceData.contentOutlinesList;
            this.dPath = guidanceData.dPath;
            this.essentials = guidanceData.essentials;
            this.isMultiView = guidanceData.isMultiView;
            setTimeout(function () {
                self.scroll("", document.querySelector("a[href*='" + guidanceData.jumpDpath + "']"));
            }, 100);
            if (guidanceData.jumpToString) {
            }

            if (!this.dPath.startsWith('zb/a2ioc')) {
                this.libContent = true;
            } else if (this.dPath.startsWith('zb/a2ioc')) {
                this.libContent = false;
            }

        } else {

            var previousRoute = this._navigationService.getPreviousRoute();
            this._navigationService.navigate(previousRoute.previousRoute, this._navigationService.getStateParams(previousRoute.previousRoute), undefined, true);
        }

    }

    openSaveToFolderModal(): void {
        let content = {
            "title": this.guidanceHeader,
            "url": this.dPath,
            "searchResult": null
        };
        let modalOptions = { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false };
        this.saveToFolderContent = JSON.parse(JSON.stringify(content));
        this.saveToFolderModalComponent.openModal(modalOptions);
    }


    saveFileToFolder(folder: any) {
        if (folder) {
            var createFolder = new CreateFolerViewModel();
            createFolder.subscriberClientId = folder.subscriberClientID;
            createFolder.folderId = folder.folderNameID;
            createFolder.url = (this.viewModel.subTopicDomainPath) ? this.viewModel.subTopicDomainPath : this.viewModel.domainPath;
            createFolder.title = (this.viewModel.practiceArea) ? this.viewModel.practiceArea : this.viewModel.title;
            this._foldersService.CreateDocument(createFolder).subscribe(data => {
                this.saveToFolderModalComponent.onCloseModal(true);
            });
        }
        else
            alert("Please select a folder");
    }

    onCloseSaveToFolderModal(eventData: any) {
        this.saveToFolderContent = null;
    }

    get subtopicBreadCrumb() {
        return this._navigationService.routes.find(r => r.currentRoute == '/sub-topics');
    }

    get guidanceNoteBreadCrumb() {
        return this._navigationService.routes.find(r => r.currentRoute == '/guidance-note');
    }

    get guidanceNoteDetailBreadCrumb() {
        return this._navigationService.routes.find(r => r.currentRoute.indexOf('guidance-note-detail') > -1);
    }

    breadCrumbNavigation(routes, route) {
        this.backButton = true;
        var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
        var paTitle = this.gnDetailObj.practiceArea;
        var domainPath = this.gnDetailObj.domainPath;
        var selectedPracticeArea;
        if (paTitle.startsWith('Tax -') || paTitle.startsWith('Real Estate -')) {
            selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
            var practiceAreas = this._dataStoreService.getSessionStorageItem("AllModulesPAs");
            selectedPracticeArea = practiceAreas.find(nI => paTitle == nI.title);
            this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
        } else {
            selectedPracticeArea = practiceAreas.find(nI => paTitle == nI.title);
            this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);

        }

        if (this.gnDetailObj.redirectedFrom && this.gnDetailObj.redirectedFrom == "folder-detail" && route == 'guidanceNote') {

            var topic = undefined;
            var subtopic = undefined;
            if (this.isPgModule(domainPath)) {
                topic = selectedPracticeArea.subTocItem.find(nI => domainPath.split('/')[4] == nI.domainId);
                subtopic = topic.subTocItem.find(nI => domainPath.split('/')[5] == nI.domainId);

            } else {
                topic = selectedPracticeArea.subTocItem.find(item => domainPath.split('/')[3] == item.domainPath.split('/')[3]);
                subtopic = topic.subTocItem.find(nI => domainPath.split('/')[4] == nI.domainId);
            }
            var input = { "subTopicDomainPath": subtopic.domainPath, "title": selectedPracticeArea.title + " > " + subtopic.title, "practiceArea": subtopic.title, rootArea: selectedPracticeArea.title, "subTopic": subtopic };

            this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));


        }
        else if ((this.gnDetailObj.redirectedFrom && this.gnDetailObj.redirectedFrom == "folder-detail" && route == 'subTopic') || route == 'subTopic') {
            this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
            if (paTitle.startsWith('Tax -') || paTitle.startsWith('Real Estate -')) {
                var practiceAreas = this._dataStoreService.getSessionStorageItem("AllModulesPAs");
                var selectedPracticeArea = practiceAreas.find(nI => paTitle == nI.title);
                this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
                this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(selectedPracticeArea));

            } else {
                var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
                var selectedPracticeArea = practiceAreas.find(nI => paTitle == nI.title);
                this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
                this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(selectedPracticeArea));
            }

        } else {
            if (this._navigationService.isNavigationSubTopic || route == 'guidanceNote')
                if (this._navigationService.isNavigationSubTopic == undefined || this.viewModel.lmtTitlePath) {
                    var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
                    var topic = undefined;
                    var subtopic = undefined;
                    if (this.isPgModule(domainPath)) {

                        if (paTitle.startsWith('Tax -') || paTitle.startsWith('Real Estate -')) {
                            var practiceAreas = this._dataStoreService.getSessionStorageItem("AllModulesPAs");
                            selectedPracticeArea = practiceAreas.find(nI => paTitle == nI.title);
                            this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);

                        }
                        topic = selectedPracticeArea.subTocItem.find(nI => domainPath.split('/')[4] == nI.domainId);
                        subtopic = topic.subTocItem.find(nI => domainPath.split('/')[5] == nI.domainId);
                    } else {
                        topic = selectedPracticeArea.subTocItem.find(item => domainPath.split('/')[3] == item.domainPath.split('/')[3]);
                        subtopic = (topic !== undefined) ? topic.subTocItem.find(nI => domainPath.split('/')[4] == nI.domainId) : {};
                    }
                    var input = {
                        "subTopicDomainPath": subtopic.domainPath,
                        "title": selectedPracticeArea.title + " > " + subtopic.title,
                        "practiceArea": subtopic.title,
                        "rootArea": selectedPracticeArea.title,
                        "subTopic": subtopic
                    };

                    this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
                } else {
                    this._navigationService.navigate(routes.currentRoute, routes.previousRouteStateParams);
                }
            else
                this._router.navigateByUrl("/practice-areas");
        }
    }


    scroll(id, element = undefined) {
        let el = element ? element : document.getElementById(id);
        let scrollEle = document.getElementById('newpg');
        if (el != null) {
            var topPos = el.offsetTop;
            topPos = element ? (topPos - 20) : topPos;
            if (this._pageService.mobiView) {

                if (/msie\s|trident\/|edge\//i.test(window.navigator.userAgent))
                    window.scroll(0, topPos + document.getElementById("topnav").offsetHeight + 50);
                else
                    window.scrollTo(0, topPos + document.getElementById("topnav").offsetHeight + 50);
            } else {
                if (/msie\s|trident\/|edge\//i.test(window.navigator.userAgent))
                    scrollEle.scrollTop = (topPos + document.getElementById("topnav").offsetHeight + 50);
                else
                    scrollEle.scrollTo(0, topPos + document.getElementById("topnav").offsetHeight + 50);
            }

        } else {
            this._pageService.setPageView();
        }

    }

    openFileDownloadModal() {
        let fileInfo: any = {
            fileTitle: this.guidanceHeader,
            fileFormat: "pdf"
        }
        let modalOptions: any = { backdrop: 'static', keyboard: false };
        this.downloadModalComponent.openModal(fileInfo, modalOptions);
    }

    downloadFile(eventData: any): void {
        let fileData = new RenderContentRequest();
        fileData.downloadContent = "true";
        fileData.hasChildren = "true";
        fileData.isMultiView = "true";
        fileData.fromPage = "PGS";
        fileData.dpath = this.dPath;
        fileData.title = eventData.fileTitle;
        fileData.fileFormat = eventData.fileFormat;
        this.downloadModalComponent.closeModal();
        this._contentService.GetContent(fileData).subscribe((content: any) => {
            if (content && content.isValid) {
                this._contentService.downloadattachment(content.fileContent, content.fileName, content.mimeType);
            } else {
                let params: ErrorContent = {
                    message: PgMessages.constants.guidanceNote.downloadError,
                    showOk: true,
                    showCancel: false,
                    callBack: undefined
                }
                this._errorModalService.open(params);
            }
        });
    }

    openEmailModal() {
        this._emailModalService.open(this.domainId, "true");
    }


    getPermaLink() {
        this._contentService.GetPermaLink({ dPath: this.dPath }).subscribe(data => {
            if (data !== null) {
                this.permaLink = data;
            }
        });
    }

    openPermaLinkModal(): void {
        let modalOptions: any = { backdrop: 'static', keyboard: false };
        if (this.permaLink) {
            this.permalinkModalComponent.openModal(modalOptions);
        } else {
            this._contentService.GetPermaLink({ dPath: this.dPath }).subscribe(data => {
                if (data !== null) {
                    this.permaLink = data;
                    this.permalinkModalComponent.openModal(modalOptions);
                }
            });
        }
    }

    openGuidanceDetail(dpath, hasChild) {
        this.backButton = true;
        var rendrContentRequest: RenderContentRequest = new RenderContentRequest();
        rendrContentRequest.dpath = dpath;
        rendrContentRequest.hasChildren = 'true';
        this.isGuidanceNote = true;
        this.dPath = dpath;
        var historyData = {};
        historyData['guidanceHeader'] = this.guidanceHeader;
        historyData['authorNames'] = this.authorNames;
        historyData['dPath'] = this.dPath;
        historyData['contentOutlinesList'] = this.contentOutlinesList;
        historyData['essentials'] = this.essentials;
        historyData['isMultiView'] = this.isMultiView;
        historyData['guidanceDetail'] = this.guidanceDetail;
        historyData['jumpDpath'] = this.jumpDpath;
        this.guidanceDetailHistory.push(historyData);
        this._contentService.contentGuidanceDetails(rendrContentRequest).subscribe(data => {
            if (this.guidances) {
                this.contentOutlinesList = [];
                this.guidances.forEach((guidance, guidanceInd) => {
                    if (guidance.domainPath == dpath) {
                        this.guidanceHeader = guidance.title;
                        guidance.subContentDomains.forEach((subHeader, subHeadInd) => {
                            this.contentOutlinesList.push({ 'domainId': subHeader.domainId, 'title': (guidanceInd + 1) + "." + (subHeadInd + 1) + " " + subHeader.title });
                        });
                    }
                });
            }
            data = JSON.parse(data);
            if (!dpath.startsWith("zb/a2ioc")) {
                var divElmnt = document.getElementById("docp");
                divElmnt.classList.add("libcontent-div");
            }
            this.guidanceDetail = data.fileStrContent;
            this.guidanceDetail = this.guidanceDetail.replace(this.guidanceHeader, "");
            this.guidanceHeader = data.fileName.replace(data.fileExtension, "");
            this.showGuidanceDetail = true;
            if (data.authorName) {
                this.authorNames = data.authorName;
            } else {
                this.authorNames = "";
            }

            this.essentials = [];
            this.showGuidanceDetail = true;
            this.scrollTop();

        });



    }

    ngAfterViewInit() {

        this.contentOutlinesList = [];

        var eles = window.document.getElementsByClassName("db_title");
        for (var i = 0; i < eles.length; i++) {
            var ele = eles[i];
            this.contentOutlinesList.push({ 'domainId': ele.id, 'title': ele.innerHTML });
        }
        if (this.dPath) {
            var dpath = this.dPath;
            var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
            let selectedPA = practiceAreas.find(pa => dpath.indexOf(pa.domainPath) == 0);
            if (selectedPA != undefined) {

                let topic = selectedPA.subTocItem.find(tp => dpath.indexOf(tp.domainPath) == 0);
                let subTopic = topic.subTocItem.find(st => dpath.indexOf(st.domainId) != -1);

                if (subTopic != null && subTopic.type == "ST") {
                    var subTopics = [];
                    var selectedGND = selectedPA.subTocItem.find(st => dpath.indexOf(st.domainId) != -1);
                    if (selectedGND != undefined) {
                        subTopics.push(selectedGND);


                        let paName = selectedPA.title;
                        if (selectedPA.type == "PA-MD") {
                            paName = selectedPA.actualTitle;
                        }
                        this._essentialService.getEssentialsCount({ practiceAreaName: paName }).subscribe(allFilters => {
                            let aggrFilters = this._essentialService.aggregateEssentials(allFilters);
                            let topics;
                            let documentType;

                            if (aggrFilters.topics != undefined) {
                                topics = Object.keys(aggrFilters.topics).map(topic => {
                                    return { title: topic, isSelected: true, count: aggrFilters.topics[topic]['total'], topic: topic, isTopic: true, topicData: aggrFilters.topics[topic] };
                                });
                            }

                            if (aggrFilters.documentTypes != undefined) {
                                documentType = Object.keys(aggrFilters.documentTypes).map(docTitle => {
                                    return { title: docTitle, isSelected: true, count: aggrFilters.documentTypes[docTitle], isTopic: false, topic: docTitle };
                                });
                            }

                            this._essentialService.getAllEssentialsByPage({ topics: topics.concat(documentType), page: 1, size: 5, practiceAreaName: paName }).subscribe((essentials) => {
                                if (essentials && essentials.length > 0) {
                                    if (essentials[0].isValid) {
                                        this.essentials = essentials;
                                    } else {
                                        this.essentials = [];
                                    }
                                } else {
                                    this.essentials = [];
                                }

                            });
                        });

                    }

                } else {

                }

            } else {
                this.essentials = [];
            }
        }
        if (this.jumpToID) {
            this.scroll(this.jumpToID);
        } else {
            this.scrollTop();
        }
    }

    ngAfterContentInit() {
    }

    scrollTop() {
        this._pageService.setPageView();
    }

    isPgModule(domainPath: string) {
        return (domainPath.indexOf('b2ioc') > -1 || domainPath.indexOf('nor6d') > -1 ? true : false);
    }

}
