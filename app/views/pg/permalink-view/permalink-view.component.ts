import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { RenderContentRequest } from '../../../shared/models/dashboard/content-request.model';
import { ContentService } from '../../../shared/services/content/content.service';
import { DataStoreService } from '../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { PgConstants } from '../../../shared/constants/pg.constants';
import { StateParams } from '../../../shared/models/state-params/state-params.model';
import { ContentInfo } from '../../../shared/models/content/contentInfo.model';
import { DownloadContentInfo } from '../../../shared/models/content/contentInfo.model';
import { EmailModalService } from '../../../shared/services/email-modal/email-modal.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { CompileDirective } from '../../../shared/directives/compile.directive';
import { EssentialsComponent } from '../../../shared/components/essentials/essentials.component';
import { ImageDirective } from '../../../shared/directives/image.directive';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { PracticeAreaService } from '../../../shared/services/practice-areas/practice-areas.service';
import { GuidanceNoteService } from '../../../shared/services/guidance-note/guidance-note.service';
import { PagerService } from '../../../shared/services/pager/pager.service';
import { SaveToFolderModalComponent } from '../../../shared/components/save-to-folder-modal/save-to-folder-modal.component';
import { PermalinkModalComponent } from '../../../shared/components/permalink-modal/permalink-modal.component';

@Component({
    selector: 'permalink-view',
    templateUrl: './permalink-view.component.html',
    styleUrls: ['./permalink-view.component.scss'],
    providers: [ContentService, GuidanceNoteService]
})
export class PermalinkViewComponent implements OnInit {

    @ViewChild(EssentialsComponent) essentialComponent: EssentialsComponent;
    @ViewChild(CompileDirective) compile: CompileDirective;
    @ViewChild(ImageDirective) imagesrc: ImageDirective;
    @ViewChild(SaveToFolderModalComponent) saveToFolderModalComponent: SaveToFolderModalComponent;
    @ViewChild(PermalinkModalComponent) permalinkModalComponent: PermalinkModalComponent;

    dpath: string;
    contentInfo: ContentInfo;
    downloadContentInfo: DownloadContentInfo;
    title: string;
    contentHTML: string;
    modalRef: BsModalRef;
    permaLink: string = "";
    downloadModalRef: BsModalRef;
    saveToFolderContent;
    loadFolders;
    permaLinkId: string;
    essentials;
    isGuidanceNote;
    contentOutlinesList: any[] = [];
    contentHistory: any[] = [];
    userName; password;
    practiceArea: string = "";
    rootArea: string = "";

    constructor(
        private _practiceAreaService: PracticeAreaService,
        private _authService: AuthService,
        private _contentService: ContentService,
        private route: ActivatedRoute,
        private _dataStoreService: DataStoreService,
        private _navigationService: NavigationService,
        private modalService: BsModalService,
        private _emailModalService: EmailModalService,
        private _guidanceNoteService: GuidanceNoteService,
        private _pagerService: PagerService
    ) { }

    ngOnInit() {
        const firstParam: string = this.route.snapshot.queryParamMap.get('pgNew');
        const fromLib: string = this.route.snapshot.queryParamMap.has('LibToPg') ? this.route.snapshot.queryParamMap.get('LibToPg') : undefined;

        this._dataStoreService.setSessionStorageItem('userToken', firstParam);
        if (this.route.snapshot.queryParamMap.keys.length > 0) {
            let subscriberClientId = this.route.snapshot.queryParamMap.get('subscriberClientId');
            let subscriberId = this.route.snapshot.queryParamMap.get('subscriberId');
            let username = this.route.snapshot.queryParamMap.get('userName');
            if (username && subscriberClientId && subscriberId) {
                this.userName = username;
                this._dataStoreService.setSessionStorageItem("uName", username);
                this._dataStoreService.setSessionStorageItem("subscriberId", subscriberId);
                this._dataStoreService.setSessionStorageItem("subscriberClientId", subscriberClientId);
                if (this.userName != null && subscriberId) {
                    this._authService.login(this.userName, this.password).subscribe((response) => {
                        response.token = firstParam;
                        this._dataStoreService.setSessionStorageItem('userToken', response);
                        this._authService.getUserInfo().subscribe(userInfo => {
                            this._dataStoreService.setSessionStorageItem("userInfo", userInfo);
                            let userProfile = this._dataStoreService.getSessionStorageItem("userInfo");
                            let subscriberClientId = this.route.snapshot.queryParamMap.get('subscriberClientId');
                            let permalink = this.route.snapshot.queryParamMap.get('permalink');
                            let dpath = this.route.snapshot.queryParamMap.get("extDpath");

                            this._practiceAreaService.getPracticeAreas().subscribe(pas => {
                                if (pas != null) {
                                    this._dataStoreService.setSessionStorageItem("AllPracticeAreas", pas);
                                    this._contentService.setModulesAsPracticeAreas(pas);
                                    if (permalink != "") {
                                        this.permaLinkId = permalink;
                                        //this._contentService.GetPermaLinkData({ permalink: permalink }).subscribe(dpath => {
                                        if (dpath) {
                                            this.dpath = dpath;
                                            let input = {};
                                            input["extDpath"] = dpath;
                                            input["isSubTopic"] = "";
                                            input["permalink"] = permalink;
                                            input["contentZone"] = 32;
                                            this._contentService.GetContentType(input).subscribe(data => {
                                                this.contentInfo = data;
                                                var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
                                                //var selectedPracticeArea = practiceAreas.find(nI => paTitle == nI.title);
                                                var allPAs = this._dataStoreService.getSessionStorageItem("AllModulesPAs");

                                                switch (data.contentPageType) {
                                                    case PgConstants.constants.ContentPageType.Content:
                                                        this.title = data.title;
                                                        if (fromLib == "yes") {
                                                            var paDomainId = dpath.split('/')[2];
                                                            var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
                                                            var selectedPracticeArea = practiceAreas.find(nI => paDomainId == nI.domainId);
                                                            this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
                                                            var topic1 = selectedPracticeArea.subTocItem ? selectedPracticeArea.subTocItem.find(nI => dpath.split('/')[3] == nI.domainId) : {};
                                                            var subtopic = topic1.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId);
                                                            var paTitle = selectedPracticeArea.title;
                                                            if (selectedPracticeArea.domainId == 'b2ioc' || selectedPracticeArea.domainId == 'nor6d') {
                                                                var paModule = selectedPracticeArea.subTocItem ? selectedPracticeArea.subTocItem.find(nI => dpath.split('/')[3] == nI.domainId) : {};
                                                                topic1 = paModule.subTocItem ? paModule.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId) : {};
                                                                subtopic = topic1.subTocItem ? topic1.subTocItem.find(nI => dpath.split('/')[5] == nI.domainId) : {};
                                                                var spa = allPAs.find(nI => dpath.split('/')[3] == nI.domainId);
                                                                paTitle = spa.title;

                                                            }
                                                            var domainPathLength = dpath.split('/').length;
                                                            var guidancedetail = {
                                                                "domainPath": dpath,
                                                                "domainId": dpath.split('/')[domainPathLength - 1],
                                                                "parentDomainId": dpath.split('/')[domainPathLength - 2],
                                                                "title": data.title,
                                                                "practiceArea": paTitle,
                                                                "topic": subtopic.title,
                                                                "subtopic": subtopic,
                                                                "essentials": [],
                                                                "hasChildren": true,
                                                                "fromLib": fromLib == 'yes' ? true : false

                                                            };
                                                            this.practiceArea = subtopic.title;
                                                            this.rootArea = paTitle;
                                                            let inputdata = {
                                                                "practiceArea": subtopic.title,
                                                                "rootArea": paTitle,
                                                                "subTopic": subtopic,
                                                                "subTopicDomainPath": subtopic.domainPath,
                                                                "title": paTitle + " > " + subtopic.title,
                                                            }
                                                            if (domainPathLength == 6 || domainPathLength == 8) {
                                                                if (selectedPracticeArea.domainId == 'b2ioc' || selectedPracticeArea.domainId == 'nor6d') {

                                                                    var spa = allPAs.find(nI => dpath.split('/')[3] == nI.domainId);
                                                                    this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", spa);

                                                                    this.practiceArea = subtopic.title;
                                                                    this.rootArea = paTitle;
                                                                    let inputdata = {
                                                                        "practiceArea": subtopic.title,
                                                                        "rootArea": paTitle,
                                                                        "subTopic": subtopic,
                                                                        "subTopicDomainPath": subtopic.domainPath,
                                                                        "title": paTitle + " > " + subtopic.title,
                                                                    }
                                                                    this.getGNdetailData(inputdata, guidancedetail);
                                                                } else {
                                                                    var newItem = { "domainPath": dpath, "hasChildren": false, "back": false };
                                                                    this.navigateToContentView(newItem);
                                                                }

                                                            } else {
                                                                if (selectedPracticeArea.domainId == 'b2ioc' || selectedPracticeArea.domainId == 'nor6d') {
                                                                    var newItem = { "domainPath": dpath, "hasChildren": false, "back": false };
                                                                    this.navigateToContentView(newItem);
                                                                } else {
                                                                    this.getGNdetailData(inputdata, guidancedetail);
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            this.showContent();
                                                        }
                                                        break;

                                                    case PgConstants.constants.ContentPageType.PractiseArea:
                                                        break;

                                                    case PgConstants.constants.ContentPageType.SubTopic:

                                                        let selectedPA = practiceAreas.find(pa => dpath.indexOf(pa.domainPath) == 0);
                                                        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPA);
                                                        var topic = selectedPA.subTocItem ? selectedPA.subTocItem.find(nI => dpath.split('/')[3] == nI.domainId) : {};
                                                        var subTopic = topic.subTocItem ? topic.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId) : {};
                                                        var input = undefined;
                                                        if (selectedPA.domainId == 'b2ioc' || selectedPA.domainId == 'nor6d') {
                                                            var pamodule = subTopic;
                                                            subTopic = pamodule.subTocItem.find(nI => dpath.split('/')[5] == nI.domainId);
                                                            subTopic.redirectedFrom = "folder-detail";
                                                            var paTtl = '';
                                                            if (selectedPA.title.includes('Income Tax')) {
                                                                paTtl = 'Tax' + ' - ' + topic.title;
                                                                subTopic.title = 'Tax' + ' - ' + topic.title;
                                                            }
                                                            else if (selectedPA.title.includes('Real Estate')) {
                                                                paTtl = 'Real Estate' + ' - ' + topic.title;
                                                                subTopic.title = 'Tax' + ' - ' + topic.title;
                                                            }
                                                            input = {
                                                                "subTopicDomainPath": subTopic.domainPath,
                                                                "title": selectedPA.title + " > " + subTopic.title,
                                                                "practiceArea": paTtl,
                                                                "rootArea": paTtl,
                                                                "subTopic": subTopic,
                                                                "fromLib": fromLib == 'yes' ? true : false
                                                            };
                                                        } else {
                                                            subTopic = topic.subTocItem.find(nI => dpath.split('/')[4] == nI.domainId);
                                                            subTopic["redirectedFrom"] = "folder-detail";
                                                            input = {
                                                                "subTopicDomainPath": subTopic.domainPath,
                                                                "title": selectedPA.title + " > " + subTopic.title,
                                                                "practiceArea": subTopic.title,
                                                                "rootArea": selectedPA.title,
                                                                "subTopic": subTopic,
                                                                "fromLib": fromLib == 'yes' ? true : false
                                                            };
                                                        }
                                                        if (subTopic != null && subTopic.type == "ST" && subTopic.domainId == data.contentId) {

                                                            this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));

                                                        }

                                                        break;
                                                    case PgConstants.constants.ContentPageType.Topic:
                                                        break;
                                                    default:
                                                }
                                            });
                                        }
                                        //});
                                    }//closing if
                                }
                            });
                        });
                    });
                }
            }
        }

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
    navigateToContentView(newItem) {
        this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
        this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
        this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
    }

    getGNdetailData(viewModel, guidanceDetail) {

        this._guidanceNoteService.getHomeContentForSubTopic(viewModel).subscribe(data => {
            var subTopicData = data;
            var guidances = [];
            var commentarys = [];
            var legislations = [];
            var caseLaws = [];

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
            commentarys = subTopicData.result.commentary;
            legislations = subTopicData.result.legislation;
            caseLaws = subTopicData.result["case law"];
            guidanceDetail["guidances"] = guidances;
            guidanceDetail.essentials = this.essentials;
            guidanceDetail.redirectedFrom = "folder-detail";

            this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidanceDetail));
        }, error => {

            //this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidanceDetail));
        });
    }

    showContent() {
        let input = {};
        input["extDpath"] = this.dpath;
        input["isSubTopic"] = "";
        input["permalink"] = this.permaLinkId;
        input["contentZone"] = 32;

        //let dPath = this.dpath.split("/");
        //dPath = dPath.slice(0, dPath.length - 2);
        //input["extDpath"] = dPath.join("/");
        //this._contentService.GetPermaLinkView(input).subscribe(data => {

        this._contentService.GetPermaLinkViewData(input).subscribe(data => {
            if (data) {
                data.fileStrContent = this._contentService.buildHtml(data.fileStrContent);
                this.downloadContentInfo = data;
                this.title = this.downloadContentInfo.fileName ? this.downloadContentInfo.fileName.replace(this.downloadContentInfo.fileExtension, "") : "";
            }
        });
        //});
    }

    openLibContent(domainPath: string, selectedTabName: string, selectedTabIndex: string) {
        this.openLContent(domainPath);
    }

    openLContent(domainPath: string) {
        var splitArray = domainPath.split('/');
        domainPath = splitArray[splitArray.length - 1];
        this._contentService.downloadContent({ dPath: domainPath, hasChildren: false }).subscribe(data => {
            this.downloadContentInfo = data;
            this.title = this.downloadContentInfo.fileName ? this.downloadContentInfo.fileName.replace(this.downloadContentInfo.fileExtension, "") : "";
        });
    }

    openEmailModal() {
        this._emailModalService.open(this.dpath, "true");
    }

    openSaveToFolderModal() {
        let content = { "title": this.title, "url": this.dpath, "searchResult": null };
        let modalOptions = { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false };
        this.saveToFolderContent = JSON.parse(JSON.stringify(content));
        this.saveToFolderModalComponent.openModal(modalOptions);
    }

    saveFileToFolder(eventData: any): void { }

    onCloseSaveToFolderModal(eventData: any): void { }

    getFoldersAll(template) {
        this.loadFolders = true;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false });
    }

    openPermaLinkModal() {
        let modalOptions: any = { backdrop: 'static', keyboard: false };
        if (this.permaLink) {
            this.permalinkModalComponent.openModal(modalOptions);
        } else {
            this._contentService.GetPermaLink({ dPath: this.dpath }).subscribe(data => {
                if (data !== null) {
                    this.permaLink = data;
                    this.permalinkModalComponent.openModal(modalOptions);
                }
            });
        }
    }

    downloadEssentials(data) {
        let input = {};
        input["dpath"] = data.domainPath;
        input["hasChildren"] = (data.hasChildren) ? "true" : "false";
        this._contentService.downloadContent(input).subscribe(data => {
            this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
        });
    }
}
