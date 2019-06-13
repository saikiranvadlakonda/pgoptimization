import { Component, NgZone, OnInit, OnDestroy, ViewChild, Input, ChangeDetectorRef, TemplateRef, AfterViewChecked, AfterViewInit, AfterContentInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { Observable } from 'rxjs/Observable';
import { GuidanceNoteService } from '../../../../shared/services/guidance-note/guidance-note.service';
import { ContentService } from '../../../../shared/services/content/content.service';
import { EssentialsComponent } from '../../../../shared/components/essentials/essentials.component';
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


@Component({
    selector: 'guidance-note-detail',
    templateUrl: './guidance-note-detail.component.html',
    styleUrls: ['./guidance-note-detail.component.css']
})
export class GuidanceNoteDetailComponent implements OnInit, AfterViewInit, AfterContentInit {
    @ViewChild(EssentialsComponent) essentialComponent: EssentialsComponent;
    @ViewChild(CompileDirective) compile: CompileDirective;
    @ViewChild(ImageDirective) imagesrc: ImageDirective;
    private subscriptions: Subscription = new Subscription(); scrollVal;
    constructor(
        private _guidanceNoteService: GuidanceNoteService,
        private _contentService: ContentService,
        private _routerProxy: RouterProxy,
        private _navigationService: NavigationService,
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: BsModalService,
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
    essentials;
    guidances;
    legislations;
    commentarys;
    caseLaws;
    subTopic;
    title;
    practiceArea;
    rootArea; isPDF: boolean = false; pdfTitle = ""; pdfContent = "";
    paGuidance: string = "";
    guidanceDetail: string;
    guidanceHeader: string = "";
    authorNames: string = "";
    showGuidanceDetail: boolean = false;
    contentOutlinesList: any[] = [];
    loadFolders: boolean = false;//added by saikiran
    saveToFolderContent;
    showGuidance: boolean = true;
    rendrContentRequest: RenderContentRequest = new RenderContentRequest();
    showGuidanceDetailChildContent: boolean = false;
    guidanceDetailChildContent: string = "";
    modalRef: BsModalRef; downloadModalRef: BsModalRef;
    @ViewChild('modalContent') modalContent: TemplateRef<any>;
    viewModel;
    saveFolderTitle;
    domainId: string = ""; permaLink: string = "";
    fileTitle: string = ''; fileFormat: any; isGuidanceNote: boolean = true;
    isValidFileTitle: boolean = true; isMultiView: boolean = true;
    dPath = ''; jumpToID: string = "";
    guidanceDetailHistory = [];
    gnDetailObj: any;
    backButton: boolean = true;
    jumpToString: string = "";
    libContent: boolean = false;
    jumpDpath = "";
    ngOnInit() {
        const stateSubscription = this._routerProxy.getViewModel().subscribe((guidancedetail) => {
            if (guidancedetail) {
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
                //this.getPermaLink();
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
                    this.scrollTop();//window.scrollTo(0, 0);
                }
                this.gnDetailObj = guidancedetail;
            }

        });

        this.subscriptions.add(stateSubscription);
    }

    setFrameHeight(scrollHeight, offsetHeight, clientHeight) {

    }

    showHideGuidanceReference(val) {
        this.showGuidance = val;
    }

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
        this.saveFolderTitle = this.viewModel.title;
        this.rendrContentRequest.dpath = guidancedetail.domainPath;
        this.rendrContentRequest.hasChildren = hasChild;
        this.contentOutlinesList = [];
        this.guidanceHeader = this.viewModel.title;
        this.fileTitle = this.viewModel.title;
        this.dPath = guidancedetail.domainPath;
        this._contentService.contentGuidanceDetails(this.rendrContentRequest).subscribe(data => {
            data = JSON.parse(data);

            if (this.guidances) {
                this.guidances.forEach((guidance, guidanceInd) => {
                    if (guidance.domainPath == guidancedetail.domainPath) {
                        this.guidanceHeader = guidance.title;//(guidance.title.trim().indexOf(">") == 0 ? guidance.title : " > " +guidance.title);
                        this.fileTitle = guidance.title;
                        guidance.subContentDomains.forEach((subHeader, subHeadInd) => {
                            this.contentOutlinesList.push({ 'domainId': subHeader.domainId, 'title': (guidanceInd + 1) + "." + (subHeadInd + 1) + " " + subHeader.title });
                        });
                    }
                });

            }
            if (data !== null && data.fileStrContent != null && data.isValid) {
                this.guidanceDetail = data.fileStrContent;
                //this.guidanceDetail = this.buildHtml(this.guidanceDetail);
                //this.guidanceDetail = this.buildNewHTML(this.guidanceDetail);
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
                //this.guidanceDetailHistory.push(historyData);
                //this.guidanceDetailHistory.push(historyData);
                if (guidancedetail.isKeySections) {
                    this.jumpToID = guidancedetail.jumpToID;
                    //this.scroll(this.jumpToID);
                }

                if (!this.dPath.startsWith('zb/a2ioc')) {
                    this.libContent = true;
                }
                if (guidancedetail.fromSearch) {
                    //console.log(guidancedetail.jumpString);
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

        this._essentialService.getEssential(subTopics).subscribe((essentials: any) => {
            if (essentials && essentials.length > 0 && essentials[0].isValid) {
                this.essentials = [];
                var topics = essentials;
                topics.forEach(topic => {
                    if (topic.essentials) {
                        topic.essentials.forEach(e => {
                            e.subContentDomains.forEach(s => {
                                s.eType = topic.pageType;
                                s.guidance = topic.subTopicName;
                                this.essentials.push(s);
                            });
                        });
                    }
                });
            } else {
                this.essentials = [];
            }
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

            if (content && content.isValid) {
                if (content.mimeType == "text/html") {
                    this.backButton = true;
                    this.guidanceDetailChildContent = content.fileStrContent;
                    //this.guidanceDetailChildContent = this.buildNewHTML(this.guidanceDetailChildContent);
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
                    this.fileTitle = title;
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

                } else if (content.mimeType == "application/pdf" && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                    this.isPDF = true;
                    this.pdfTitle = content.fileName.replace(".pdf", '');
                    this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + rendRequest.dpath.split("/").pop();
                    this.guidanceDetailHistory.pop();
                    this.scrollTop();
                }
                else {
                    this._contentService.downloadattachment(content.fileContent, content.fileName, content.mimeType);
                    this.guidanceDetailHistory.pop();
                }
            } else {
                this.backButton = true;

                this.guidanceDetailChildContent = content.fileStrContent;
                //this.guidanceDetailChildContent = this.buildNewHTML(this.guidanceDetailChildContent);
                this.guidanceDetail = this.guidanceDetailChildContent;
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
                this.fileTitle = title;
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
                    this.scrollTop();//window.scrollTo(0, 0);
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

    buildHtml(input: string): string {
        var regex1 = new RegExp(`onclick="javascript:window.parent.parent.addTab[(]'Loading...','PGS/ContentView.aspx[?]dpath[=]`);
        var regex2 = new RegExp(`onclick="javascript:window.parent.parent.addTab[(]'Loading...', 'Library/ContentView.aspx[?]dpath[=]`);
        var regex3 = new RegExp(`src[=]"/Content/ContentResponse.aspx[?]dpath[=]`);
        /*var regex4 = new RegExp(`(?<=authorsNames">)(.*)(?=<\/span>)`, 'g');
        var titleRegex = new RegExp(`(?<=title">)(.*)(?=<\/title>)`, 'g');
        if (titleRegex.test(input)) {
            this.fileTitle = input.match(titleRegex)[0];
            this.guidanceHeader = this.fileTitle;
        }
    
        if (regex4.test(input)) {
            this.authorNames = input.match(regex4)[0];
        } else {
            this.authorNames = "";
        }*/

        //  input = input.replace(new RegExp('<p', 'g'), "<div");
        //  input = input.replace(new RegExp('</p>', 'g'), "</div><br />");
        input = input.replace(new RegExp('&#xD;&#xA;&#x9;&#x9;&#x9;&#x9;&#x9;', 'g'), "");
        input = input.replace(new RegExp('&#13;&#10;&#9;&#9;&#9;&#9;&#9;', 'g'), "");
        input = input.replace(new RegExp('&#xD;&#xA;            ', 'g'), "");
        input = input.replace(new RegExp('&#xA;            ', 'g'), "");
        input = input.replace(new RegExp('&#x9;', 'g'), "");
        input = input.replace(new RegExp(`onclick="openLContent`, 'g'), `(click)="openLContent`);
        input = input.replace(new RegExp(`onclick="openMVContent`, 'g'), `(click)="openMVContent`);
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
        input = input.replace('&#xA;', ';');

        //input = input.replace(new RegExp('{', 'g'), '{{');
        return input;
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
            this.guidanceDetailHistory = this.guidanceDetailHistory;
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

    showFolderModal(modal) {
        this.openModal(modal);
    }

    openModal(template: TemplateRef<any>) {
        var content = {
            "title": this.guidanceHeader,
            "url": this.dPath,
            "searchResult": null
        };
        this.saveToFolderContent = JSON.parse(JSON.stringify(content));

        this.modalRef = this.modalService.show(template, { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false });
        this.loadFolders = true;
        //this.getFoldersAll(template);
    }

    folderInfo;
    selectedMainFolder;
    selectedSubsciberClientId;
    mainFolder;
    selFolder;
    getFoldersAll(template) {
        this.folderInfo = this._dataStoreService.getSessionStorageItem("ClientFolders");
        if (!this.folderInfo) {
            this._foldersService.getFolders().subscribe(data => {
                if (data !== null) {
                    this.folderInfo = data;
                    if (this.selectedSubsciberClientId)
                        this.selectedMainFolder = this.folderInfo.find(f => f.subscriberClientId == this.selectedSubsciberClientId);
                    this.modalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
                } else {
                    this.folderInfo = [];
                }
            });
        }
        else {
            this.modalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
            this.selectedMainFolder = this.folderInfo[0];
            this.selectedSubsciberClientId = this.selectedMainFolder.subscriberClientId;
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

    selectedFolder(folder) {
        this.selFolder = folder;
    }

    SaveFile() {
        if (this.selFolder) {
            var createFolder = new CreateFolerViewModel();
            createFolder.subscriberClientId = this.selFolder.subscriberClientID;
            createFolder.folderID = this.selFolder.folderNameID;
            createFolder.url = (this.viewModel.subTopicDomainPath) ? this.viewModel.subTopicDomainPath : this.viewModel.domainPath;
            createFolder.title = (this.viewModel.practiceArea) ? this.viewModel.practiceArea : this.viewModel.title;
            this._foldersService.CreateDocument(createFolder).subscribe(data => {
                this.modalRef.hide();
            });
        }
        else
            alert("Please select a folder");
    }
    onSaveToFolderClick(folder) {
        this.selFolder = folder;
        this.SaveFile();
    }
    onPopUpCloseClick() {
        this.loadFolders = false;
        this.saveToFolderContent = null;
        this.modalRef.hide();
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

            // this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
            //var topic = selectedPracticeArea.subTocItem.find(nI => domainPath.split('/')[3] == nI.domainId);
            //var subtopic = topic.subTocItem.find(nI => domainPath.split('/')[4] == nI.domainId);
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

            //  var input = { "subTopicDomainPath": domainId, "title": null, "practiceArea": null, rootArea: null };
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
            // this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(selectedPracticeArea));

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
                        subtopic = (topic !== undefined) ? topic.subTocItem.find(nI => domainPath.split('/')[4] == nI.domainId) : undefined;
                    }
                    var input = {
                        "subTopicDomainPath": subtopic.domainPath,
                        "title": selectedPracticeArea.title + " > " + subtopic.title,
                        "practiceArea": subtopic.title,
                        "rootArea": selectedPracticeArea.title,
                        "subTopic": subtopic
                    };

                    //var input = {
                    //    "subTopicDomainPath": this.viewModel.subtopic.domainPath,
                    //    "title": selectedPracticeArea.title + " > " + this.viewModel.subtopic.title,
                    //    "practiceArea": this.viewModel.subtopic.title,
                    //    rootArea: selectedPracticeArea.title,
                    //    "subTopic": this.viewModel.subtopic
                    //};
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
            /*
            if (window.navigator.userAgent.indexOf("Edge") == -1)
                scrollEle.scrollTo(0, 0);
            else
                scrollEle.scrollTop = 0;
            */
        }

    }
    openFileDownloadModal(template: TemplateRef<any>) {
        this.fileTitle = this.guidanceHeader;
        this.fileFormat = "pdf";
        this.downloadModalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
    }

    validate() {
        if (this.fileTitle != undefined && this.fileTitle != null && this.fileTitle.trim() != '') {
            this.isValidFileTitle = true;
            var fileData = new RenderContentRequest();
            fileData.downloadContent = "true";
            fileData.dpath = this.dPath;//this.viewModel.subTopicDomainPath;
            fileData.title = this.fileTitle;
            fileData.fileFormat = this.fileFormat;
            fileData.hasChildren = "True";//this.isMultiView ? "True" : "False";
            fileData.isMultiView = "True";//this.isMultiView ? "True" : "False";
            fileData.fromPage = "PGS";
            this.downloadModalRef.hide();
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
        } else {
            this.isValidFileTitle = false;
        }
    }
    closeFileDialog() {
        this.downloadModalRef.hide();
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

    openPermaLinkModal(template: TemplateRef<any>) {
        if (this.permaLink == "" || this.permaLink) {
            this._contentService.GetPermaLink({ dPath: this.dPath }).subscribe(data => {
                if (data !== null) {
                    this.permaLink = data;
                    this.downloadModalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
                    setTimeout(function () {
                        var inputElmnt = (document.querySelector("input#permalinkContent") as HTMLInputElement);
                        inputElmnt.focus();
                        inputElmnt.setSelectionRange(0, 200, "forward");//inputElmnt.value.length);
                    }, 200);
                    this.modalService.onShown.subscribe((next, error, complete) => {
                        setTimeout(function () {
                            var inputElmnt = (document.querySelector("input#permalinkContent") as HTMLInputElement);
                            inputElmnt.focus();
                            inputElmnt.setSelectionRange(0, 200, "forward");//inputElmnt.value.length);
                        }, 200);
                        try {
                            (document.querySelector("input#permalinkContent") as HTMLInputElement).select();
                        }
                        catch (e) {

                        }
                    });
                    this.modalService.onShow.subscribe((next, error, complete) => {
                        try {
                            (document.querySelector("input#permalinkContent") as HTMLInputElement).select();
                        }
                        catch (e) {

                        }
                    });
                }
            });

        } else {
            this.downloadModalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
            this.modalService.onShown.subscribe((next, error, complete) => {
                try {
                    (document.querySelector("input#permalinkContent") as HTMLInputElement).select();

                }
                catch (e) {

                }

            });
            this.modalService.onShow.subscribe((next, error, complete) => {
                try {
                    (document.querySelector("input#permalinkContent") as HTMLInputElement).select();

                }
                catch (e) {

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
                        this.guidanceHeader = guidance.title;//(guidance.title.trim().indexOf(">") == 0 ? guidance.title : " > " +guidance.title);
                        this.fileTitle = guidance.title;
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
            // this.guidanceDetail = this.buildHtml(this.guidanceDetail);
            //this.guidanceDetail = this.buildNewHTML(this.guidanceDetail);
            this.guidanceDetail = this.guidanceDetail.replace(this.guidanceHeader, "");
            this.guidanceHeader = data.fileName.replace(data.fileExtension, "");
            this.showGuidanceDetail = true;
            if (data.authorName) {
                this.authorNames = data.authorName;
            } else {
                this.authorNames = "";
            }

            //this.guidanceDetail = data;
            //this.guidanceDetail = this.buildHtml(this.guidanceDetail);
            //data = this.guidanceDetail;

            //var regex4 = new RegExp(`(?<=<(.*)db_title_disable")(.*)(?=<\/p>)`, 'g');
            //if (regex4.test(data.fileStrContent)) {
            //    var title = data.match(regex4);
            //    if (title && title.length > 0) {
            //        title = title[0];
            //        title = title.match(new RegExp(`(?<=(.*)>)(.*)`, 'g'));
            //        this.guidanceHeader = title[0];
            //    }

            //}
            //this.guidanceDetail = this.guidanceDetail.replace(this.guidanceHeader, "");
            //var titlesReg = new RegExp(`(?<=<(.*)db_title")(.*)(?=<\/)`, 'g');
            ////this.contentOutlinesList.push({ 'domainId': subHeader.domainId, 'title': (guidanceInd + 1) + "." + (subHeadInd + 1) + " " + subHeader.title });
            //if (titlesReg != null && titlesReg.test(data)) {
            //    var titles = data.match(titlesReg);
            //    if (titles && titles.length > 0) {
            //        for (var i = 0; i < titles.length; i++) {
            //            var matching = titles[i].match(new RegExp(`(?<=(.*)>)(.*)`, 'g'));
            //            if (matching != null && matching.length > 0) {
            //                matching = matching[0];
            //                //if (this.contentOutlinesList && this.contentOutlinesList.length>0 && this.contentOutlinesList.find(col => col.title.indexOf(matching) != -1)) {

            //                //} else {
            //                //    this.contentOutlinesList.push({domainId: ''});
            //                //}
            //            }
            //            //this.contentOutlinesList.find(col => col.title.indexOf(titles[i])!=-1);
            //        }
            //    }

            //}
            this.essentials = [];
            //db_title
            this.showGuidanceDetail = true;
            this.scrollTop();//window.scrollTo(0, 0);
            /*
            var regex4 = new RegExp(`(?<=<(.*)db_title">)(.*)(?=<\/p>)`, 'g');
            if (regex4.test(data)) {
                var contentHeadersList = data.match(regex4);
                var contentList = [];
                for (var i = 0; i < contentHeadersList.length; i++) {
                    var ele = contentHeadersList[i];
                    //contentList.push({ 'domainId': ele.getAttribute("id"), title: ele.innerText });
                    //.push({ 'domainId': subHeader.domainId, 'title': (guidanceInd + 1) + "." + (subHeadInd + 1) + " " + subHeader.title });
                    //ele.getAttribute("id");
                }
 
                this.contentOutlinesList = contentList;
 
            } else {
                //this.authorNames = "";
            }
            */


        });



    }

    ngAfterViewInit() {
        //window.scrollTo(0, 0);


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
            //this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPA);
            if (selectedPA != undefined) {

                let topic = selectedPA.subTocItem.find(tp => dpath.indexOf(tp.domainPath) == 0);
                let subTopic = topic.subTocItem.find(st => dpath.indexOf(st.domainId) != -1);

                if (subTopic != null && subTopic.type == "ST") {
                    var subTopics = [];
                    var selectedGND = selectedPA.subTocItem.find(st => dpath.indexOf(st.domainId) != -1);
                    if (selectedGND != undefined) {
                        subTopics.push(selectedGND);
                        this._essentialService.getEssential(subTopics).subscribe(data => {
                            this.essentials = [];
                            var topics = data;
                            topics.forEach(topic => {
                                if (topic.essentials) {
                                    topic.essentials.forEach(e => {
                                        e.subContentDomains.forEach(s => {
                                            s.eType = topic.pageType;
                                            s.guidance = topic.subTopicName;
                                            this.essentials.push(s);
                                        });
                                    });
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
            this.scrollTop();//window.scrollTo(0, 0);
        }
    }

    ngAfterContentInit() {
    }

    scrollTop() {
        this._pageService.setPageView();
        /*
        let scrollEle = document.getElementById('newpg');
        if (window.navigator.userAgent.indexOf("Edge") == -1)
            scrollEle.scrollTo(0, 0);
        else
            scrollEle.scrollTop = 0;
        */
    }

    isPgModule(domainPath: string) {
        return (domainPath.indexOf('b2ioc') > -1 || domainPath.indexOf('nor6d') > -1 ? true : false);
    }

}
