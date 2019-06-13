import { Component, OnInit, OnDestroy, ViewChild, Input, ChangeDetectorRef, TemplateRef } from '@angular/core';
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
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FoldersService } from '../../../../shared/services/folders/folders.service';
import { CreateFolerViewModel } from '../../../../shared/models/Repository/Create.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { PgModalService } from '../../../../shared/services/pg-modal/pg-modal.service';
import { NewItemEntity } from '../../../../shared/models/whats-new/new-group.model';
import { EmailModalService } from '../../../../shared/services/email-modal/email-modal.service';
import { Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { PgMessages } from '../../../../shared/constants/messages';
import { ErrorModalService } from '../../../../shared/services/error-modal/error-modal.service';
import { ErrorContent } from '../../../../shared/models/error-content/error-content.model';
import { PagerService } from '../../../../shared/services/pager/pager.service';

@Component({
    selector: 'app-guidance-note',
    templateUrl: './guidance-note.component.html',
    styleUrls: ['./guidance-note.component.css']
})
export class GuidanceNoteComponent implements OnInit {
    @ViewChild(EssentialsComponent) essentialComponent: EssentialsComponent;
    @ViewChild(CompileDirective) compile: CompileDirective;
    private subscriptions: Subscription = new Subscription();
    private subscriptionModal: Subscription[] = []; scrollVal;
    constructor(
        private _guidanceNoteService: GuidanceNoteService,
        private _contentService: ContentService,
        private _routerProxy: RouterProxy,
        private _navigationService: NavigationService,
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: BsModalService,
        private _foldersService: FoldersService,
        private _dataStoreService: DataStoreService,
        private _modalService: PgModalService,
        private _emailModalService: EmailModalService,
        private _errorModalService: ErrorModalService,
        private _router: Router,
        location: LocationStrategy,
        private _pagerService: PagerService
    ) {

    }
    essentials;
    guidances;
    legislations;
    commentarys;
    caseLaws;
    subTopic;
    title;
    practiceArea;
    rootArea;
    paGuidance: string = "";
    guidanceDetail: string;
    guidanceHeader: string = "";
    showGuidanceDetail: boolean = false;
    contentOutlinesList: string[] = [];
    permaLink: string = "";
    showGuidance: boolean = true;
    rendrContentRequest: RenderContentRequest = new RenderContentRequest();
    showGuidanceDetailChildContent: boolean = false;
    guidanceDetailChildContent: string = "";
    modalRef: BsModalRef;
    downloadModalRef: BsModalRef;
    unsubscribeModalRef: BsModalRef;
    @ViewChild('modalContent') modalContent: TemplateRef<any>;
    viewModel;
    saveFolderTitle;
    loadFolders: boolean = false;
    saveToFolderContent;
    domainId; isPDF: boolean = false;    pdfTitle = "";    pdfContent = "";
    fileTitle: string = ''; fileFormat: any;
    isValidFileTitle: boolean = true;
    subTopicTitle: string;
    redirectedFrom: string;
    isGuidanceView: boolean = true;
    guidanceError: string;
    referenceError: string;
    backButton: boolean = true;

    ngOnInit() {
        const stateSubscription = this._routerProxy.getViewModel().subscribe((viewModel) => {
            if (viewModel) {
                var routerProxy = this._routerProxy;
                this._navigationService.getPreviousRoute();
                var router = this._router;
                var navigation = this._navigationService;
                viewModel = viewModel.subTopic ? viewModel : this._dataStoreService.getSessionStorageItem("guidanceNote");
                this.viewModel = viewModel;
                this.domainId = (this.viewModel.subTopic) ? this.viewModel.subTopic.domainId : this.viewModel.subTopicDomainPath;
                this.practiceArea = viewModel.subTopic.title;
                if (viewModel.subTopic.redirectedFrom && viewModel.subTopic.redirectedFrom == "folder-detail") {
                    this.redirectedFrom = viewModel.subTopic.redirectedFrom;
                }
                if (viewModel.subTopicDomainPath) {
                    this._guidanceNoteService.getHomeContentForSubTopic(viewModel).subscribe(data => {
                        if (data !== null) {
                            this.subTopic = data;
                            this.rootArea = this.viewModel.rootArea;

                            if (this.subTopic.result["documentPathTitles"].length > 0) {
                                this.rootArea = this.viewModel ? this.viewModel.rootArea : this.subTopic.result["documentPathTitles"][1].title;
                                this.subTopicTitle = this.subTopic.result["documentPathTitles"][(this.subTopic.result["documentPathTitles"].length - 2)].title;
                                this.title = this.rootArea + ' > ' + this.subTopicTitle;
                                this.practiceArea = this.subTopicTitle;
                            } else {
                                this.subTopicTitle = this.viewModel.subTopic.title;
                                this.title = this.rootArea + ' > ' + this.subTopicTitle;
                                this.practiceArea = this.viewModel.subTopic.title;
                            }
                            if (viewModel.fromLib && viewModel.fromLib == true) {
                                this.backButton = false;
                            }

                            this.saveFolderTitle = this.practiceArea;

                            if (this.subTopic.result["forms & precedents"] != null) {
                                this.getEssentials(this.subTopic.result["forms & precedents"], "Forms & precedents");
                            }
                            if (this.subTopic.result["checklists"] != null) {
                                this.getEssentials(this.subTopic.result["checklists"], "Checklists");
                            }
                            if (this.subTopic.result["other resources"] != null) {
                                this.getEssentials(this.subTopic.result["other resources"], "Other resources");
                            }
                            this.essentials = !this.essentials ? [] : this.essentials;
                            if (this.subTopic.result.guidance && this.subTopic.result.guidance.length > 0 && this.subTopic.result.guidance[0].isValid) {
                                this.guidances = this.subTopic.result.guidance;
                                this._dataStoreService.setSessionStorageItem("Guidances", this.guidances);
                                this.guidanceError = (this.guidances.length == 0) ? PgMessages.constants.guidanceNote.noGuidance : undefined;
                            } else {
                                this.guidances = [];
                                this.guidanceError = (Array.isArray(this.guidances)) ? PgMessages.constants.guidanceNote.noGuidance : PgMessages.constants.guidanceNote.error;
                            }

                            this.commentarys = this.subTopic.result.commentary;
                            this.legislations = this.subTopic.result.legislation;
                            this.caseLaws = this.subTopic.result["case law"];
                            if (this.subTopic.result.overview) {
                                this.subTopic.result.overview.forEach(overview => {
                                    /*if (overview.topicType !== "ST") {
                                        this.paGuidance += overview.rawContent;
                                    }*/
                                    this.paGuidance = overview.overview;
                                });
                            }
                        } else {
                            this.guidances = [];
                            this.commentarys = [];
                            this.legislations = [];
                            this.caseLaws = [];
                            this.rootArea = this.viewModel.rootArea;
                            this.subTopicTitle = this.viewModel.subTopic.title;
                            this.guidanceError = PgMessages.constants.guidanceNote.error;
                            this.referenceError = PgMessages.constants.guidanceNote.error;
                        }
                    });
                    this.getPermaLink();
                }
                this._pagerService.setPageView();
                /*
                //window.scrollTo(0, 0);
                let scrollEle = document.getElementById('newpg');
                if (window.navigator.userAgent.indexOf("Edge") == -1)
                    scrollEle.scrollTo(0, 0);
                else
                    scrollEle.scrollTop = 0;
                */
            }

            //var selectedPA = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
            //if (selectedPA.title != viewModel.rootArea)
            //    this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", viewModel);
        });

        this.subscriptions.add(stateSubscription);
    }

    showHideGuidanceReference(val) {
        this.showGuidance = val;
    }

    navigateToGuidanceDetails(guidancedetail) {
        //guidancedetail.title = this.title;
        guidancedetail.practiceArea = this.rootArea;
        guidancedetail.topic = this.subTopicTitle;
        this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        guidancedetail['essentials'] = guidancedetail.isReferences ? [] : this.essentials;
        if (selectedPracticeArea) {
            if (selectedPracticeArea.isSubscribed) {
                this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidancedetail));
            }
            else
                this._modalService.open();
        }
        else
            this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidancedetail));
    }

    openLContent(domainPath: string) {
        var splitArray = domainPath.split('/');
        domainPath = splitArray[splitArray.length - 1];
        this.downloadContent(domainPath, "false");
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
    }
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    openMVContent(dpath: string, hasChildren: string) {
        this.downloadContent(dpath.split('#')[0], hasChildren);
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

    downloadContent(dpath, hasChildren) {
        var rendRequest = new RenderContentRequest();
        rendRequest.dpath = dpath;
        rendRequest.hasChildren = hasChildren
        this.guidanceDetailChildContent = null;
        this.showGuidanceDetailChildContent = false;


        this._contentService.downloadContent(rendRequest).subscribe((content: any) => {

            if (content && content.isValid) {
                if (content.mimeType == "text/html") {
                    /*this.showGuidanceDetailChildContent = true;
                    this.guidanceDetailChildContent = content.fileStrContent;//this.buildHtml(this._contentService.getHtmlContent(data.fileContent));
                    this.guidanceDetailChildContent = this.buildNewHTML(this.guidanceDetailChildContent);
                    this.compile.compile = this.guidanceDetailChildContent;
                    this.compile.compileContext = this;
                    this.compile.compRef.changeDetectorRef.detectChanges();
                    this.compile.ngOnChanges();
                } */
                    this.showGuidanceDetailChildContent = true;
                    this.guidanceDetailChildContent = PgMessages.constants.error;
                    this.guidanceDetailChildContent = this.buildNewHTML(this.guidanceDetailChildContent);
                    if (this.compile) {
                        this.compile.compile = this.guidanceDetailChildContent;
                        this.compile.compileContext = this;
                        this.compile.compRef.changeDetectorRef.detectChanges();
                        this.compile.ngOnChanges();
                    }
                    

                } else if (content.mimeType == "application/pdf" && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                    this.isPDF = true;
                    this.pdfTitle = content.fileName.replace(".pdf", '');
                    this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + rendRequest.dpath.split("/").pop();
                    this._pagerService.setPageView();
                    /*
                    let scrollEle = document.getElementById('newpg');
                    if (window.navigator.userAgent.indexOf("Edge") == -1)
                        scrollEle.scrollTo(0, 0);
                    else
                        scrollEle.scrollTop = 0;
                    */
                }
            } else {

            }
        });


    }

    changedTab(evnt: any) {
        if (evnt != undefined && evnt.index == 1) {
            this.isGuidanceView = false;
        } else {
            this.isGuidanceView = true;
        }
    }

    openLibContent(libContent) {
        //openLibContent(label, dpath, pgsdpath, tabIndex, tabName)
        var dpath = libContent.dpath == undefined ? libContent.domainPath : libContent.dpath;
        var pathParam;
        var pgsdpath = this.domainId;
        if ((dpath.indexOf("nilc") != -1 || dpath.indexOf("kilc") != -1 || dpath.indexOf("454f") != -1 ||
            dpath.indexOf("sigzc") != -1 || dpath.indexOf("b6q3d") != -1 || dpath.indexOf("dyeed") != -1 || dpath.indexOf("wrg4c") != -1 || dpath.indexOf("owsp") != -1 ||
            dpath.indexOf("ubxe") != -1 || dpath.indexOf("xlvg") != -1 || dpath.indexOf("smkj") != -1 || dpath.indexOf("8vai") != -1 || dpath.indexOf("8vai") != -1 ||
            dpath.indexOf("5gug") != -1 || dpath.indexOf("gpdi") != -1 || dpath.indexOf("fmwg") != -1 || dpath.indexOf("ljxl") != -1) && pgsdpath == undefined) {
            //subTopicContent(label, dpath, pgsdpath, tabIndex, tabName);
            this.navigateToGuidanceDetails(libContent);
        }
        else {
            if (dpath != null && dpath != "" && dpath != undefined && pgsdpath == undefined && dpath.indexOf("kilc") == -1) {
                var subPath = dpath.substring(0, dpath.lastIndexOf('/'));
                var ParentPath = subPath.substring(subPath.lastIndexOf('/') + 1);
                pathParam = ParentPath.split("#")[0];
            }
            else {
                pathParam = pgsdpath;
            }
            this._contentService.HasAccessToContent({ dpath: pathParam }).subscribe(isSubscribed => {
                if (!isSubscribed) {
                    this._modalService.open();
                } else {
                    //libContent.domainPath = pathParam;
                    this.navigateToGuidanceDetails(libContent);
                }
            });
            //HandleAjax("SubscriberService.asmx/HasAccessToContent", "{ dpath: '" + pathParam + "'}", function (args) { onHasAccessToContent(args.d, label, dpath, pgsdpath, tabIndex, tabName) }, onError);
        }

    }

    downloadEssentials(data) {
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        if (selectedPracticeArea.isSubscribed) {
            this.rendrContentRequest.dpath = data.domainPath;
            this.rendrContentRequest.hasChildren = (data.hasChildren) ? "true" : "false";
            this._contentService.downloadContent(this.rendrContentRequest).subscribe(data => {
                if ((data.mimeType == "application/pdf" || data.mimeType.indexOf("pdf") != -1) && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                    this.isPDF = true;
                    this.pdfTitle = data.fileName.replace(".pdf", '');
                    this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + this.rendrContentRequest.dpath.split("/").pop();
                    this._pagerService.setPageView();
                    /*
                    let scrollEle = document.getElementById('newpg');
                    if (window.navigator.userAgent.indexOf("Edge") == -1)
                        scrollEle.scrollTo(0, 0);
                    else
                        scrollEle.scrollTop = 0;
                    */
                } else {
                    this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
                }
            });
        }
        else
            this._modalService.open();
    }

    buildHtml(input: string): string {
        var regex1 = new RegExp(`onclick="javascript:window.parent.parent.addTab[(]'Loading...','PGS/ContentView.aspx[?]dpath[=]`);
        var regex2 = new RegExp(`onclick="javascript:window.parent.parent.addTab[(]'Loading...', 'Library/ContentView.aspx[?]dpath[=]`);
        var regex3 = new RegExp(`src[=]"/Content/ContentResponse.aspx[?]dpath[=]`);

        input = input.replace(new RegExp('<p', 'g'), "<div");
        input = input.replace(new RegExp('</p>', 'g'), "</div><br />");
        input = input.replace(new RegExp('&#xD;&#xA;&#x9;&#x9;&#x9;&#x9;&#x9;', 'g'), "");
        input = input.replace(new RegExp('&#13;&#10;&#9;&#9;&#9;&#9;&#9;', 'g'), "");
        input = input.replace(new RegExp('&#x9;', 'g'), "");
        input = input.replace(new RegExp(`onclick="openLContent`, 'g'), `(click)="openLContent`);
        input = input.replace(new RegExp(`onclick="openMVContent`, 'g'), `(click)="openMVContent`);
        input = input.replace(new RegExp(regex1, 'g'), `(click)="openDContent('`);
        input = input.replace(new RegExp(regex2, 'g'), `(click)="openDContent('`);
        input = input.replace(new RegExp(`href="#`, 'g'), `class="underLine`);
        input = input.replace(new RegExp('[^\u0000-\u007F]', 'g'), ' ');
        input = input.replace(new RegExp(regex3, 'g'), '[image-src]="');

        return input;
    }

    openDContent(domainPath: string) {
        if (domainPath.indexOf('#') !== -1)
            domainPath = domainPath.split('#')[0];
        this.downloadContent(domainPath, "false");
    }



    showFolderModal(modal) {

        this.openModal(modal);
    }

    openModal(template: TemplateRef<any>) {
        var content = {
            "title": (this.viewModel.practiceArea) ? this.viewModel.practiceArea : this.viewModel.title,
            "url": (this.viewModel.subTopicDomainPath) ? this.viewModel.subTopicDomainPath : this.viewModel.domainPath,
            "searchResult": null
        };
        this.saveToFolderContent = JSON.parse(JSON.stringify(content));

        this.getFoldersAll(template);
    }

    folderInfo;
    selectedMainFolder;
    selectedSubsciberClientId;
    mainFolder;
    selFolder;
    getFoldersAll(template) {
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

    back() {
        this.breadCrumbNavigation(this.subtopicBreadCrumb);
       // this._navigationService.navigate(this._navigationService.previousRoute, this._navigationService.getStateParams(this._navigationService.previousRoute));
    }

    onPopUpCloseClick() {
        this.loadFolders = false;
        this.saveToFolderContent = null;
        this.modalRef.hide();
    }

    loadContentView(guidancecontent) {
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        if (selectedPracticeArea) {
            if (selectedPracticeArea.isSubscribed) {
                this.navigateToContentView(guidancecontent);
            }
            else
                this._modalService.open();
        }
        else
            this.navigateToContentView(guidancecontent);

    }

    navigateToContentView(guidancecontent) {
        var file = new NewItemEntity();
        file.domainPath = guidancecontent.domainPath;
        file.title = guidancecontent.title;
        file.hasChildren = "True";
        this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
        this._dataStoreService.setSessionStorageItem("selectedNewItem", file);

        var guidancedetail: any = {};
        this.guidances.forEach(gd => {
            if (gd.subContentDomains && gd.subContentDomains.length > 0) {
                var gdn = gd.subContentDomains.find(g => g.domainId == guidancecontent.domainId);
                if (gdn) {
                    guidancedetail = gd;
                }
            }
        });
        guidancedetail.practiceArea = this.rootArea;
        guidancedetail.topic = this.subTopicTitle;
        //guidancedetail.topic = this.subTopic.result["documentPathTitles"][3].title;

        //guidancedetail.domainPath = guidancecontent.domainPath;
        //guidancedetail.title = guidancecontent.title;
        guidancedetail.hasChildren = true;
        guidancedetail.isKeySections = true;
        guidancedetail.jumpToID = guidancecontent.domainId;
        if (guidancecontent.domainId == null && guidancecontent.domainPath != "") {
            var domainInd = guidancecontent.domainPath.split("/");
            guidancedetail.domainId = domainInd[domainInd.length - 1];
            if (guidancecontent.domainPath.indexOf("zb/") != 0) {
                guidancecontent.domainPath = "zb/" + guidancecontent.domainPath;
            }
        }
        if (!guidancedetail.domainPath) {
            guidancedetail.domainPath = guidancecontent.domainPath;
        }
        if (!guidancedetail.title) {
            guidancedetail.title = guidancecontent.title;
        }
        guidancedetail['isReferences'] = true;
        this.navigateToGuidanceDetails(guidancedetail);
        //this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
        //this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidancedetail));
    }

    openEmailModal(unsubscribeModal) {
        var input = {
            domainId: this.domainId,
            isMultiview: false
        };
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        if (selectedPracticeArea && selectedPracticeArea.isSubscribed) {
            this._emailModalService.open(input, "true");
        } else {
            this.unsubscribeModalRef = this.modalService.show(unsubscribeModal, { class: 'unauthorize-modal', backdrop: 'static', keyboard: false });
        }
    }

    openUnsubscribeModal(template): void {
        this.modalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
    }

    get subtopicBreadCrumb() {
        return this._navigationService.routes.find(r => r.currentRoute == '/sub-topics');
    }

    get guidanceNoteBreadCrumb() {
        return this._navigationService.routes.find(r => r.currentRoute == '/guidance-note');
    }

    breadCrumbNavigation(routes) {
        this.backButton = true;
        //if (this.redirectedFrom == "folder-detail") {

        if (this.redirectedFrom == "folder-detail" || !routes) {

            if (this.rootArea.startsWith('Tax -') || this.rootArea.startsWith('Real Estate -')) {
                var practiceAreas = this._dataStoreService.getSessionStorageItem("AllModulesPAs");
                var selectedPracticeArea = practiceAreas.find(nI => this.rootArea == nI.title);
                this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
                this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(selectedPracticeArea));

            } else {
                var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
                var selectedPracticeArea = practiceAreas.find(nI => this.rootArea == nI.title);
                this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
                this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(selectedPracticeArea));
            }
            
        } else {
            if (this._navigationService.isNavigationSubTopic) {
                var selectedPA = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
                if (selectedPA == undefined) {
                    var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
                    var selectedPracticeArea = practiceAreas.find(nI => this.rootArea == nI.title);
                    this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
                }
                this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(this._dataStoreService.getSessionStorageItem("SelectedPracticeArea")));
            }
            else {

                //this._router.navigateByUrl("/practice-areas");
            }
        }
    }
    openFileDownloadModal(template: TemplateRef<any>, unsubscribeModal: TemplateRef<any>) {
        this.fileTitle = this.practiceArea;
        this.fileFormat = "pdf";
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        if (selectedPracticeArea && selectedPracticeArea.isSubscribed) {
            this.downloadModalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
        } else {
            this.unsubscribeModalRef = this.modalService.show(unsubscribeModal, { backdrop: 'static', keyboard: false });
        }
    }

    validate() {
        if (this.fileTitle != undefined && this.fileTitle != null && this.fileTitle.trim() != '') {
            this.isValidFileTitle = true;
            var fileData = new RenderContentRequest();
            fileData.downloadContent = "true";
            fileData.hasChildren = "true";
            fileData.isMultiView = "false";
            fileData.fromPage = "PGS";
            fileData.dpath = this.viewModel.subTopicDomainPath;
            fileData.title = this.fileTitle;
            fileData.fileFormat = this.fileFormat;
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

    getPermaLink() {
        this._contentService.GetPermaLink({ dPath: this.viewModel.subTopicDomainPath }).subscribe(data => {
            if (data !== null) {
                this.permaLink = data;
            }
        });
    }

    openPermaLinkModal(template: TemplateRef<any>) {
        this.downloadModalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
        setTimeout(function () {
            var inputElmnt = (document.querySelector("input#permalinkContent") as HTMLInputElement);
            inputElmnt.focus();
            inputElmnt.setSelectionRange(0, 200, "forward");//inputElmnt.value.length);
        }, 200);
        this.modalService.onShown.subscribe((next, error, complete) => {

            try {



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

    permalinkOpened(status, eve) {
        //console.log(status, eve);
    }

    isScrolled(ev) {
        //console.log(ev);
        this.scrollVal = ev;
    }
}
