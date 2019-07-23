import { Component, OnInit, OnDestroy, ViewChild, Input, TemplateRef } from '@angular/core';
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
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FoldersService } from '../../../../shared/services/folders/folders.service';
import { CreateFolerViewModel } from '../../../../shared/models/Repository/Create.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { PgModalService } from '../../../../shared/services/pg-modal/pg-modal.service';
import { NewItemEntity } from '../../../../shared/models/whats-new/new-group.model';
import { EmailModalService } from '../../../../shared/services/email-modal/email-modal.service';
import { PgMessages } from '../../../../shared/constants/messages';
import { ErrorModalService } from '../../../../shared/services/error-modal/error-modal.service';
import { ErrorContent } from '../../../../shared/models/error-content/error-content.model';
import { PagerService } from '../../../../shared/services/pager/pager.service';
import { SaveToFolderModalComponent } from '../../../../shared/components/save-to-folder-modal/save-to-folder-modal.component';
import { DownloadModalComponent } from '../../../../shared/components/download-modal/download-modal.component';
import { PermalinkModalComponent } from '../../../../shared/components/permalink-modal/permalink-modal.component';

@Component({
    selector: 'app-guidance-note',
    templateUrl: './guidance-note.component.html',
    styleUrls: ['./guidance-note.component.css']
})
export class GuidanceNoteComponent implements OnInit {
    @ViewChild(SaveToFolderModalComponent) saveToFolderModalComponent: SaveToFolderModalComponent;
    @ViewChild(DownloadModalComponent) downloadModalComponent: DownloadModalComponent;
    @ViewChild(PermalinkModalComponent) permalinkModalComponent: PermalinkModalComponent;

    private subscriptions: Subscription = new Subscription();
    pgConstants = PgConstants.constants;
    essentials: any[]=[];
    guidances: any[] = [];
    legislations: any[] = [];
    commentarys: any[] = [];
    caseLaws: any[] = [];
    subTopic;
    paTitle: string = "";
    rootArea: string = "";
    gnOverview: string = "";
    permaLink: string = "";
    rendrContentRequest: RenderContentRequest = new RenderContentRequest();
    modalRef: BsModalRef;
    unsubscribeModalRef: BsModalRef;
    viewModel;
    saveToFolderContent;
    domainId; isPDF: boolean = false; 
    pdfTitle :string = ""; 
    pdfContent :string = "";
    fileTitle: string = ''; 
    subTopicTitle: string;
    redirectedFrom: string;
    isGuidanceView: boolean = true;
    guidanceError: string;
    referenceError: string;
    backButton: boolean = true;

    constructor(
        private _guidanceNoteService: GuidanceNoteService,
        private _contentService: ContentService,
        private _routerProxy: RouterProxy,
        private _navigationService: NavigationService,
        private modalService: BsModalService,
        private _foldersService: FoldersService,
        private _dataStoreService: DataStoreService,
        private _modalService: PgModalService,
        private _emailModalService: EmailModalService,
        private _errorModalService: ErrorModalService,
        private _pagerService: PagerService
    ) { }

    ngOnInit() {
        const stateSubscription = this._routerProxy.getViewModel().subscribe((viewModel) => {
            if (viewModel) {
                
                viewModel = viewModel.subTopic ? viewModel : this._dataStoreService.getSessionStorageItem("guidanceNote");
                this.viewModel = viewModel;
                this.domainId = (this.viewModel.subTopic && this.viewModel.subTopic != null) ? this.viewModel.subTopic.domainId : this.viewModel.subTopicDomainPath;
                this.paTitle = viewModel.subTopic.title;
                if (viewModel.subTopic.redirectedFrom && viewModel.subTopic.redirectedFrom == "folder-detail") {
                    this.redirectedFrom = viewModel.subTopic.redirectedFrom;
                }
                if (viewModel.subTopicDomainPath) {
                    this._guidanceNoteService.getHomeContentForSubTopic(viewModel).subscribe(data => {
                        if (data !== null) {
                            this.subTopic = data;
                            this.rootArea = this.viewModel.rootArea;

                            if (this.subTopic["documentPathTitles"].length > 0) {
                                this.rootArea = this.viewModel ? this.viewModel.rootArea : this.subTopic["documentPathTitles"][1].title;
                                this.subTopicTitle = this.subTopic["documentPathTitles"][(this.subTopic["documentPathTitles"].length - 2)].title;
                                this.paTitle = this.subTopicTitle;
                            } else {
                                this.subTopicTitle = this.viewModel.subTopic.title;
                                this.paTitle = this.viewModel.subTopic.title;
                            }
                            if (viewModel.fromLib && viewModel.fromLib == true) {
                                this.backButton = false;
                            }


                            if (this.subTopic["forms & precedents"] != null) {
                                this.getEssentials(this.subTopic["forms & precedents"], "Forms & precedents");
                            }
                            if (this.subTopic["checklists"] != null) {
                                this.getEssentials(this.subTopic["checklists"], "Checklists");
                            }
                            if (this.subTopic["other resources"] != null) {
                                this.getEssentials(this.subTopic["other resources"], "Other resources");
                            }
                            this.essentials = !this.essentials ? [] : this.essentials;
                            if (this.subTopic.guidance && this.subTopic.guidance.length > 0 && this.subTopic.guidance[0].isValid) {
                                this.guidances = this.subTopic.guidance;
                                this._dataStoreService.setSessionStorageItem("Guidances", this.guidances);
                                this.guidanceError = (this.guidances.length == 0) ? PgMessages.constants.guidanceNote.noGuidance : undefined;
                            } else {
                                this.guidances = [];
                                this.guidanceError = (Array.isArray(this.guidances)) ? PgMessages.constants.guidanceNote.noGuidance : PgMessages.constants.guidanceNote.error;
                            }

                            this.commentarys = this.subTopic.commentary;
                            this.legislations = this.subTopic.legislation;
                            this.caseLaws = this.subTopic["case law"];
                            if (this.subTopic.overview) {
                                this.subTopic.overview.forEach(overview => {
                                    this.gnOverview = overview.overview;
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
                
            }
        });

        this.subscriptions.add(stateSubscription);
    }
    

    navigateToGuidanceDetails(guidancedetail) {
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

    getEssentials(essentialsList, eType) {
        if (this.essentials == null)
            this.essentials = [];
        essentialsList.forEach(e => {
            e.subContentDomains.forEach(el => {
                el.eType = eType;
                el.guidance = this.rootArea + ' > ' + this.paTitle;
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


    downloadContent(dpath, hasChildren) {
        var rendRequest = new RenderContentRequest();
        rendRequest.dpath = dpath;
        rendRequest.hasChildren = hasChildren


        this._contentService.downloadContent(rendRequest).subscribe((content: any) => {

            if (content && content.isValid) {
                 if (content.mimeType == "application/pdf" && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                    this.isPDF = true;
                    this.pdfTitle = content.fileName.replace(".pdf", '');
                    this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + rendRequest.dpath.split("/").pop();
                    this._pagerService.setPageView();
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
        var dpath = libContent.dpath == undefined ? libContent.domainPath : libContent.dpath;
        var pathParam;
        var pgsdpath = this.domainId;
        if ((dpath != null) && (dpath.indexOf("nilc") != -1 || dpath.indexOf("kilc") != -1 || dpath.indexOf("454f") != -1 ||
            dpath.indexOf("sigzc") != -1 || dpath.indexOf("b6q3d") != -1 || dpath.indexOf("dyeed") != -1 || dpath.indexOf("wrg4c") != -1 || dpath.indexOf("owsp") != -1 ||
            dpath.indexOf("ubxe") != -1 || dpath.indexOf("xlvg") != -1 || dpath.indexOf("smkj") != -1 || dpath.indexOf("8vai") != -1 || dpath.indexOf("8vai") != -1 ||
            dpath.indexOf("5gug") != -1 || dpath.indexOf("gpdi") != -1 || dpath.indexOf("fmwg") != -1 || dpath.indexOf("ljxl") != -1) && pgsdpath == undefined) {
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
                    this.navigateToGuidanceDetails(libContent);
                }
            });
        }
    }

    downloadEssentials(data) {
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        if (selectedPracticeArea.isSubscribed) {
            this.rendrContentRequest.dpath = data.domainPath ? data.domainPath : data.subTopicDomainPath;
            this.rendrContentRequest.hasChildren = (data.hasChildren) ? "true" : "false";
            if ((data.mimeType == ".pdf" || data.mimeType.indexOf("pdf") != -1) && !this._pagerService.isMobile) {
                this.isPDF = true;
                this.pdfTitle = data.title;
                this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + this.rendrContentRequest.dpath.split("/").pop();
                this._pagerService.setPageView();
            } else {
                this._contentService.downloadContent(this.rendrContentRequest).subscribe(data => {
                    this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
                });
            }
        }
        else
            this._modalService.open();
    }

    openDContent(domainPath: string) {
        if (domainPath.indexOf('#') !== -1)
            domainPath = domainPath.split('#')[0];
        this.downloadContent(domainPath, "false");
    }

    openSaveToFolderModal() {
        let content = {
            "title": (this.viewModel.practiceArea) ? this.viewModel.practiceArea : this.viewModel.title,
            "url": (this.viewModel.subTopicDomainPath) ? this.viewModel.subTopicDomainPath : this.viewModel.domainPath,
            "searchResult": null
        };
        let modalOptions = { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false };
        this.saveToFolderContent = JSON.parse(JSON.stringify(content));
        this.saveToFolderModalComponent.openModal(modalOptions);
    }


    saveFileToFolder(folder: any): void {
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

    back() {
        this.breadCrumbNavigation(this.subtopicBreadCrumb);
    }

    onCloseSaveToFolderModal(eventData: any): void {
        this.saveToFolderContent = null;
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

            }
        }
    }

    openFileDownloadModal(unsubscribeModal: TemplateRef<any>) {
        let fileInfo: any = {
            fileTitle: this.paTitle,
            fileFormat: "pdf"
        }
        let selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        if (selectedPracticeArea && selectedPracticeArea.isSubscribed) {
            let modalOptions: any = { backdrop: 'static', keyboard: false };
            this.downloadModalComponent.openModal(fileInfo, modalOptions);
        } else {
            this.unsubscribeModalRef = this.modalService.show(unsubscribeModal, { backdrop: 'static', keyboard: false });
        }
    }

    downloadFile(eventData: any): void {
        let fileData = new RenderContentRequest();
        fileData.downloadContent = "true";
        fileData.hasChildren = "true";
        fileData.isMultiView = "false";
        fileData.fromPage = "PGS";
        fileData.dpath = this.viewModel.subTopicDomainPath;
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

    getPermaLink() {
        this._contentService.GetPermaLink({ dPath: this.viewModel.subTopicDomainPath }).subscribe(data => {
            if (data !== null) {
                this.permaLink = data;
            }
        });
    }

    openPermaLinkModal() {
        let modalOptions: any = { backdrop: 'static', keyboard: false };
        this.permalinkModalComponent.openModal(modalOptions);
    }
}
