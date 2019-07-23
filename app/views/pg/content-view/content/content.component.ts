import { Component, NgZone, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { ContentService } from '../../../../shared/services/content/content.service';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CompileDirective } from '../../../../shared/directives/compile.directive';
import { EmailModalService } from '../../../../shared/services/email-modal/email-modal.service';
import { ContentInfo } from '../../../../shared/models/content/contentInfo.model';
import { GuidanceNoteService } from '../../../../shared/services/guidance-note/guidance-note.service';
import { WhatsNewService } from '../../../../shared/services/whats-new/whats-new.service';
import { PagerService } from '../../../../shared/services/pager/pager.service';
import { SaveToFolderModalComponent } from '../../../../shared/components/save-to-folder-modal/save-to-folder-modal.component';
import { PermalinkModalComponent } from '../../../../shared/components/permalink-modal/permalink-modal.component';

@Component({
    selector: 'content-view',
    templateUrl: './content.component.html',
    styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
    @ViewChild(CompileDirective) compile: CompileDirective;
    @ViewChild(SaveToFolderModalComponent) saveToFolderModalComponent: SaveToFolderModalComponent;
    @ViewChild(PermalinkModalComponent) permalinkModalComponent: PermalinkModalComponent;

    rendrContentRequest: RenderContentRequest = new RenderContentRequest();
    contentHTML: string;
    newItem: any;
    modalRef: BsModalRef;
    permaLink: string = "";
    downloadModalRef: BsModalRef;
    saveToFolderContent;
    showChildContent: boolean = false;
    contentDetail: string = '';
    authorNames: string = "";
    isPDF = false; pdfContent: any; pdfTitle: string = "";
    contentInfo: ContentInfo;
    practiceArea: string = "";
    rootArea: string = "";
    essentials;
    backButton: boolean = true;
    title: string = "";
    topic: string = "";
    previousNewItem: any;
    previousNewItems: any = [];
    initialDPath: string = '';
    domainPath: string = '';
    libContent: boolean = false;

    constructor(private _contentService: ContentService,
        private _dataStoreService: DataStoreService,
        private _navigationService: NavigationService,
        private modalService: BsModalService,
        private _emailModalService: EmailModalService,
        private _guidanceNoteService: GuidanceNoteService,
        private _whatsNewService: WhatsNewService,
        private _pagerService: PagerService,
        private zone: NgZone,
    ) {
        window['angularComponentRef'] = {
            zone: this.zone,
            openLContent: (dpath) => this.openLContent(dpath),
            openDContent: (dpath) => this.openDContent(dpath),
            openLibContent: (domainPath, selectedTabName, selectedTabIndex) =>
                this.openLibContent(domainPath, selectedTabName, selectedTabIndex),
            openMultiViewLibContent: (domainPath, selectedTabName, selectedTabIndex, isMultiView, domainId) =>
                this.openMultiViewLibContent(domainPath, selectedTabName, selectedTabIndex, isMultiView, domainId),

            component: this,
        };
    }

    ngOnInit() {
        this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");
        this.initialDPath = this.newItem.dapth ? this.newItem.dpath : this.newItem.domainPath;
        this.domainPath = this.newItem.dapth ? this.newItem.dpath : this.newItem.domainPath;
        this.previousNewItem = this.newItem;
        this.previousNewItems.push(this.newItem);
        if (this.newItem.back != undefined && this.newItem.back == false) {
            this.backButton = false;
        }
        var isInlineDownload = this._dataStoreService.getSessionStorageItem("IsInlineDownload");
        if (!isInlineDownload) {
            this.getContent();
        } else {
            if (this.domainPath.startsWith('zb/a2ioc')) {
                this.contentHTML = this._dataStoreService.getSessionStorageItem("htmlContent");
            } else {
                this.rendrContentRequest.dpath = this.newItem.domainPath;
                this.rendrContentRequest.hasChildren = this.newItem.hasChildren;
                this.downloadContent(this.rendrContentRequest.dpath, this.rendrContentRequest.hasChildren);
            }
        }
        this._pagerService.setPageView();        
    }

    getContent() {
        this.rendrContentRequest.dpath = this.newItem.domainPath;
        this.rendrContentRequest.hasChildren = this.newItem.hasChildren;
        if (this.newItem.newsCategory != undefined && this.newItem.practiceAreaTitle != undefined && this.newItem.domainPath != undefined) {
            this._whatsNewService.getWhatsNewDetail(this.newItem).subscribe(data => {
                if (data) {
                    if (data.mimeType == "text/html") {
                        this.showChildContent = true;
                        this.contentDetail = data.fileStrContent;
                        this.authorNames = data.authorName;
                        if (data.title) {
                            this.newItem["title"] = data.title;
                        } else {
                            this.newItem["title"] = data.fileName.split('.htm')[0];
                        }
                        if (this.newItem.back != undefined && this.newItem.back == false) {
                            this.backButton = false;
                        }
                        this.compileHTML(this);
                    } else if (data.mimeType == "application/pdf" && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                        this.isPDF = true;
                        this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + (this.rendrContentRequest.dpath.split("/").pop());
                        this.pdfTitle = data.fileName;
                        this._pagerService.setPageView();
                    } else {
                        this.showChildContent = true;
                        this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
                    }
                }
            });
        } else {
            this.downloadContent(this.rendrContentRequest.dpath, this.rendrContentRequest.hasChildren);
        }
    }

    back() {
        let previous = this._navigationService.getPreviousRoute();
        if (previous && previous != null && previous.previousRoute && (previous.previousRoute.startsWith('/permalink-view')
            || previous.previousRoute.startsWith('/guidance-note/guidance-note-detail')
            || previous.previousRoute.startsWith('/login'))
        ) {
            this.isPDF = false;
            var newItem;

            if (this.previousNewItems.length > 1) {
                newItem = this.previousNewItems[this.previousNewItems.length - 1];

                this.previousNewItems = this.previousNewItems.slice(this.previousNewItems.length - 1);

            } else {
                newItem = this.previousNewItem;
                this.previousNewItems = [];
            }
            this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
            this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
            this.newItem = newItem;
            this.getContent();
        } else {
            if (previous.previousRoute != undefined) {
                this._navigationService.navigate(previous.previousRoute, this._navigationService.getStateParams(previous.previousRoute));
            }
        }
    }

    openSaveToFolderModal() {
        let content = { "title": this.newItem.title, "url": this.newItem.domainPath, "searchResult": null };
        let modalOptions = { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false };
        this.saveToFolderContent = JSON.parse(JSON.stringify(content));
        this.saveToFolderModalComponent.openModal(modalOptions);
    }

    saveFileToFolder(eventData: any): void { }

    onCloseSaveToFolderModal(eventData: any): void { }

    setCurrentNewItem(dpath: string, hasChildren: string) {
        var newItem = { "domainPath": dpath, "hasChildren": hasChildren ? hasChildren : false };
        this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
        this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
        this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");
    }

    openMVContent(dpath: string, hasChildren: string) {
        this.dynamicClassAppend(dpath);
        this.previousNewItem = this.newItem;
        this.previousNewItems.push(this.newItem);
        this.setCurrentNewItem(dpath.split('#')[0], hasChildren);
        this.downloadContent(dpath.split('#')[0], hasChildren);
    }

    dynamicClassAppend(dpath){
        if (!dpath.startsWith("zb/a2ioc")) {
            var divElmnt = document.getElementById("docp");
            divElmnt.classList.add("libcontent-div");
        }
    }

    ngAfterViewInit() {
        if (!this.domainPath.startsWith("zb/a2ioc")) {
            this.libContent = true;
        }
    }
    
    downloadContent(dpath, hasChildren) {
        var rendRequest = new RenderContentRequest();
        rendRequest.dpath = dpath;
        rendRequest.hasChildren = hasChildren;
        this.showChildContent = false;
        if (this.isPgDomainPath(dpath)) {
            this.domainPath = dpath;
            var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
            var selectedPracticeArea = practiceAreas.find(nI => dpath.includes(nI.domainId));
            this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
           
            if (selectedPracticeArea.type == 'PA-MD') {
                var allPAs = this._dataStoreService.getSessionStorageItem("AllModulesPAs");
                var paModule = allPAs.find(item => dpath.split('/')[3] == item.domainId);
                var topic = (paModule !== undefined) ? paModule.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId) : undefined;
                var subtopic = (topic !== undefined) ? topic.subTocItem.find(nI => dpath.split('/')[5] == nI.domainId) : undefined;
                this.rootArea = (topic !== undefined) ? paModule.title : '';
                this.practiceArea = (subtopic !== undefined) ? subtopic.title : '';
            } else {
                var topic = selectedPracticeArea.subTocItem.find(item => dpath.split('/')[3] == item.domainPath.split('/')[3]);
                var subtopic = (topic !== undefined) ? topic.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId) : undefined;
                this.rootArea = (topic !== undefined) ? selectedPracticeArea.title : '';
                this.practiceArea = (subtopic !== undefined) ? subtopic.title : '';
            }
        }

        this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");
        this._contentService.downloadContent(rendRequest).subscribe(data => {
            if (data.mimeType == "text/html") {
                this.showChildContent = true;
                this.contentDetail = data.fileStrContent;
                if (data.title) {
                    this.newItem["title"] = data.title;
                } else {
                    this.newItem["title"] = data.fileName ? data.fileName.split('.htm')[0] : '';
                }
                if (data.fileStrContent != undefined && data.fileStrContent == "We are experiencing content issues, please try later.") {
                    this.backButton = true;
                }
                if (this.newItem.back != undefined && this.newItem.back == false) {
                    this.backButton = false;
                } else {
                    this.backButton = true;
                }
                this.authorNames = data.authorName;
                this.compileHTML(this);
            } else if (data.mimeType == "application/pdf" && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                this.backButton = true;
                this.isPDF = true;
                this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + rendRequest.dpath.split("/").pop();
                this.pdfTitle = data.fileName.split('.pdf')[0];
                this.newItem.title = data.fileName.split('.pdf')[0];
                this._pagerService.setPageView();
            } else {
                this.newItem.title = data.fileName ? data.fileName.split('.doc')[0] : '';
                if (this.newItem.back != undefined && this.newItem.back == false) {
                    this.backButton = false;
                } else {
                    this.backButton = true;
                }
                this.showChildContent = true;
                this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
            }
        });
    }

    compileHTML(event){
        if (this.compile) {
            this.compile.compile = this.contentDetail;
            this.compile.compileContext = event;
            this.compile.compRef.changeDetectorRef.detectChanges();
            this.compile.ngOnChanges();
        }
    }    

    openMultiViewLibContent(domainPath: string, selectedTabName: string, selectedTabIndex: string, isMultiView: boolean, domainId: string) {
        this.previousNewItems.push(this.newItem);
        this.setCurrentNewItem(domainPath, "false");
        var dpath = domainPath;
        this.domainPath = domainPath;
        let input = {};
        input["extDpath"] = dpath;
        input["isSubTopic"] = "";
        input["permalink"] = "";
        input["contentZone"] = 32;
        this.backButton = true;
        this._contentService.GetContentType(input).subscribe(data => {
            this.contentInfo = data;

            switch (data.contentPageType) {
                case PgConstants.constants.ContentPageType.Content:
                    if (this._contentService.isPgDomainPath(domainPath)) {
                        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
                        var topic = selectedPracticeArea.subTocItem.find(item => domainPath.split('/')[3] == item.domainPath.split('/')[3]);
                        var subtopic = topic.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId);
                        var domainPathLength = dpath.split('/').length;

                        this.practiceArea = subtopic.title;
                        this.rootArea = selectedPracticeArea.title;
                        let inputdata = {
                            "practiceArea": subtopic.title,
                            "rootArea": selectedPracticeArea.title,
                            "subTopic": subtopic,
                            "subTopicDomainPath": subtopic.domainPath,
                            "title": selectedPracticeArea.title + " > " + subtopic.title,
                        }

                        var guidancedetail = this.getGuidanceDetailsObj(dpath,domainPathLength,data,subtopic,selectedPracticeArea.title);
                        
                        if (domainPathLength == 6 || domainPathLength == 8) {

                            if (selectedPracticeArea.domainId == 'b2ioc' || selectedPracticeArea.domainId == 'nor6d') {
                                var allPAs = this._dataStoreService.getSessionStorageItem("AllModulesPAs");
                                var spa = allPAs.find(nI => domainPath.split('/')[3] == nI.domainId);
                                var paTitle = spa.title;
                                var paModule = selectedPracticeArea.subTocItem ? selectedPracticeArea.subTocItem.find(nI => domainPath.split('/')[3] == nI.domainId) : {};
                                topic = paModule.subTocItem.find(nI => domainPath.split('/')[4] == nI.domainId);
                                subtopic = topic.subTocItem.find(nI => domainPath.split('/')[5] == nI.domainId);
                                
                                var guidancedetail = this.getGuidanceDetailsObj(dpath,domainPathLength,data,subtopic,paTitle);                               
                                this.getGNdetailData(inputdata, guidancedetail);
                                this.setData(dpath,false);
                            } else {                                
                                this.setData(dpath,true);
                            }
                        } else {
                            if (selectedPracticeArea.domainId == 'b2ioc' || selectedPracticeArea.domainId == 'nor6d') {                               
                                this.setData(dpath,true);                               
                            } else {
                                this.getGNdetailData(inputdata, guidancedetail);
                                this.setData(dpath,false);                               
                            }
                        }
                    }
                    break;
                case PgConstants.constants.ContentPageType.PractiseArea:
                    this.openLContent(domainPath);
                    break;
                case PgConstants.constants.ContentPageType.SubTopic:
                    this.openLContent(domainPath);
                case PgConstants.constants.ContentPageType.Topic:
                    this.openLContent(domainPath);
                    break;
                default:
                //console.log("none has matched");
            }
        });
    }

    getGuidanceDetailsObj(dpath,domainPathLength,data,subtopic,PA){
        var guidancedetail = {
            "domainPath": dpath,
            "domainId": dpath.split('/')[domainPathLength - 1],
            "parentDomainId": dpath.split('/')[domainPathLength - 2],
            "title": data.title,
            "practiceArea": PA,
            "topic": subtopic.title,
            "subtopic": subtopic,
            "essentials": [],
            "hasChildren": true
        };
        return guidancedetail;
    }

    setData(dpath,checkFlag){
        this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
        this.newItem = this._dataStoreService.getSessionStorageItem("selectedNewItem");

        if(checkFlag){
            var newItem = { "domainPath": dpath, "hasChildren": false };
            this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
            this.getContent();    
        }else{
            this._dataStoreService.setSessionStorageItem("selectedNewItem", this.previousNewItems[this.previousNewItems.length - 1]);
        }          
    }    

    openLibContent(domainPath: string, selectedTabName: string, selectedTabIndex: string) {       
        this.dynamicClassAppend(domainPath);
        this.openLContent(domainPath);
    }

    openLContent(domainPath: string) {
        this.dynamicClassAppend(domainPath);
        this.backButton = true;
        this.previousNewItem = this.newItem;
        this.previousNewItems.push(this.newItem);
        this.setCurrentNewItem(domainPath, "false");
        var splitArray = domainPath.split('/');
        domainPath = splitArray[splitArray.length - 1];
        this.downloadContent(domainPath, "false");
    }   

    openDContent(domainPath: string) {
        this.dynamicClassAppend(domainPath);
        this.backButton = true;
        this.previousNewItem = this.newItem;
        this.previousNewItems.push(this.newItem);
        if (domainPath.indexOf('#') !== -1) {
            this.setCurrentNewItem(domainPath.split('#')[0], "false");
        } else {
            this.setCurrentNewItem(domainPath, "false");
        }
        if (domainPath.indexOf('#') !== -1) domainPath = domainPath.split('#')[0];
        this.downloadContent(domainPath, "false");
    }

    openEmailModal() {
        this._emailModalService.open(this.newItem.domainPath, "true");
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

    getGNdetailData(viewModel, guidanceDetail) {
        this._guidanceNoteService.getHomeContentForSubTopic(viewModel).subscribe(data => {
            var subTopicData = data;
            var guidances = [];

            guidances = subTopicData.result.guidance;
            this._dataStoreService.setSessionStorageItem("Guidances", guidances);
            if (subTopicData.result["forms & precedents"] != null) {
                this.getEssentials(subTopicData.result["forms & precedents"], "Forms & Precedents");
            }
            if (subTopicData.result["checklists"] != null) {
                this.getEssentials(subTopicData.result["checklists"], "Checklists");
            }
            if (subTopicData.result["other resources"] != null) {
                this.getEssentials(subTopicData.result["other resources"], "Other Resources");
            }
            guidanceDetail["guidances"] = guidances;
            guidanceDetail.essentials = this.essentials;
            guidanceDetail.redirectedFrom = "folder-detail";

            this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidanceDetail));
        });
    }
    
    openPermaLinkModal(): void {
        let dPath = this.newItem.domainPath;
        let modalOptions: any = { backdrop: 'static', keyboard: false };
        if (this.permaLink) {
            this.permalinkModalComponent.openModal(modalOptions);
        } else {
            this._contentService.GetPermaLink({ dPath: dPath }).subscribe(data => {
                if (data !== null) {
                    this.permaLink = data;
                    this.permalinkModalComponent.openModal(modalOptions);
                }
            });
        }
    }    

    isPgDomainPath(domainPath: string) {
        return (domainPath.indexOf('a2ioc') > -1 ? true : false);
    }

    isPgModule(domainPath: string) {
        return (domainPath.indexOf('b2ioc') > -1 || domainPath.indexOf('nor6d') > -1 ? true : false);
    }   
}
