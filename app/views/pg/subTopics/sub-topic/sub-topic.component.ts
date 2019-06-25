import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SubTopicService } from '../../../../shared/services/sub-topic/sub-topics.service';
import { TocItemViewModel } from '../../../../shared/models/practiceAreas';
import { Subscription } from 'rxjs/Subscription';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { Observable } from 'rxjs/Observable';
import { CategoryComponent } from '../category/category.component';
import { EssentialsComponent } from '../../../../shared/components/essentials/essentials.component';
import { ContentService } from '../../../../shared/services/content/content.service';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { PgModalService } from '../../../../shared/services/pg-modal/pg-modal.service';
import { NewItemEntity } from '../../../../shared/models/whats-new/new-group.model';
import { WhatsNewService } from '../../../../shared/services/whats-new/whats-new.service';
import { EssentialService } from '../../../../shared/services/essential/essential-service';
import { HistoryService } from '../../../../shared/services/history/history.service';
import { PracticeAreaService } from '../../../../shared/services/practice-areas/practice-areas.service';

@Component({
    selector: 'app-sub-topic',
    templateUrl: './sub-topic.component.html',
    styleUrls: ['./sub-topic.component.css'],
    providers: [ContentService, WhatsNewService, EssentialService, HistoryService]
})
export class SubTopicComponent implements OnInit, OnDestroy {

    @ViewChild(CategoryComponent) categoryComponent: CategoryComponent;
    @ViewChild(EssentialsComponent) essentialComponent: EssentialsComponent;
    private subscriptions: Subscription = new Subscription();
    rendrContentRequest: RenderContentRequest = new RenderContentRequest();
    currentTopic: TocItemViewModel;
    isPDF: boolean = false;
    pdfTitle = "";
    pdfContent = "";
    constructor(
        private _routerProxy: RouterProxy,
        private _navigationService: NavigationService,
        private _subTopicService: SubTopicService,
        private _contentService: ContentService,
        private _dataStoreService: DataStoreService,
        private _modalService: PgModalService,
        private _whatsNewService: WhatsNewService,
        private _essentialService: EssentialService,
        private _historyService: HistoryService,
        private _practiceAreaService: PracticeAreaService
    ) {
    }



    practiceArea: string;
    paGuidance: string;
    subTopics: TocItemViewModel[] = [];
    catSubTopics: TocItemViewModel[] = [];
    subTopic;
    breakingNews;
    recentCases;
    essentials;
    recentlyViewed;
    homeContent;
    test;
    news;
    whatsNewInput;

    ngOnInit() {

        const stateSubscription = this._routerProxy.getViewModel().subscribe((viewModel) => {
            if (viewModel) {
                if (viewModel.subTocItem == undefined || viewModel.subTocItem == null) {
                    let prev = this._navigationService.getStateParams("/sub-topics");
                    viewModel = prev.viewModel;
                }
                if (this.categoryComponent)
                    this.categoryComponent.getSubTopics(viewModel);
                this.currentTopic = viewModel;
                var introDomainId = "";
                viewModel.subTocItem.forEach(vm => {
                    if (vm.title.toLowerCase() == "introduction") {
                        introDomainId = vm.domainPath;
                    }
                });
                if (introDomainId) {
                    this._practiceAreaService.getIntroByDomainID({ domainId: introDomainId }).subscribe(data => {
                        this.paGuidance = data.title;
                    });
                }

                //this.getSubTopics(viewModel);
                this.getContentForSubTopic(viewModel);
                this.whatsNewInput = {
                    "domainPath": viewModel.domainPath, "tocItemType": viewModel.type, "subTopicDomainPath": viewModel.subTocItem[0].subTocItem[0].domainPath, "recordsCount": 9, "pageIndex": 0, "pageSize": 9
                };
                let subTopicDomainPath = "";
                if (viewModel.subTocItem[0].subTocItem[0].type == "ST") {
                    subTopicDomainPath = viewModel.subTocItem[0].subTocItem[0].domainPath;
                } else if (viewModel.subTocItem[0].subTocItem[0].subTocItem[0].type == "ST") {
                    subTopicDomainPath = viewModel.subTocItem[0].subTocItem[0].domainPath;
                } else {
                }
                this.whatsNewInput.subTopicDomainPath = subTopicDomainPath;
                if (viewModel.type == "MD") {
                    this.whatsNewInput.domainPath = viewModel.subTocItem[0].domainPath;
                    if (viewModel.subTocItem[0].type == "PA-MD") {
                        this.whatsNewInput.tocItemType = "PA-MD";
                    }
                }
                var selectedPA = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
                if (selectedPA.title != viewModel.title)
                    this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", viewModel);

            }
        });

        this.subscriptions.add(stateSubscription);

    }



    getContentForSubTopic(viewModel) {
        this.setSelectedSubTopic(viewModel.subTocItem[0].subTocItem[0]);
        let subTopicDomainPath = "";
        if (viewModel.subTocItem[0].subTocItem[0].type == "ST") {
            subTopicDomainPath = viewModel.subTocItem[0].subTocItem[0].domainPath;
        } else if (viewModel.subTocItem[0].subTocItem[0].subTocItem[0].type == "ST") {
            subTopicDomainPath = viewModel.subTocItem[0].subTocItem[0].domainPath;
        } else {
        }
        let input = {
            "domainPath": viewModel.domainPath, "tocItemType": viewModel.type, "subTopicDomainPath": viewModel.subTocItem[0].subTocItem[0].domainPath, "recordsCount": 5, "pageIndex": 0, "pageSize": 5
        };
        input.subTopicDomainPath = subTopicDomainPath;
        if (viewModel.type == "MD") {
            input.domainPath = viewModel.subTocItem[0].domainPath;
            if (viewModel.subTocItem[0].type == "PA-MD") {
                input.tocItemType = "PA-MD";
            }
        }
        var guidance = viewModel.title + ' > ' + viewModel.subTocItem[0].subTocItem[0].title;
        this.practiceArea = viewModel.title;

        this.getEssential();
        this.getRecentlyView();
        input.pageSize = 9;
        this.getWhatsNew(input);
        /*
        this.setSelectedSubTopic(viewModel.subTocItem[0].subTocItem[0]);
        let input = {
            "domainPath": viewModel.domainPath, "tocItemType": viewModel.type, "subTopicDomainPath": viewModel.subTocItem[0].subTocItem[0].domainPath, "recordsCount": 5
        };
        var guidance = viewModel.title + ' > ' + viewModel.subTocItem[0].subTocItem[0].title;
        this._subTopicService.getHomeContentForPractiseArea(input).subscribe(data => {
            this.homeContent = data;
            this.practiceArea = viewModel.title;
            if (this.homeContent.homePageContentForPracticeArea.result && this.homeContent.homePageContentForPracticeArea.result.intropiece) {
                this.paGuidance = this.homeContent.homePageContentForPracticeArea.result.intropiece.htmlContent;
            } else {
                this.paGuidance = this.homeContent.homePageContentForPracticeArea.intropiece.htmlContent;
            }
  
            if (this.homeContent.homePageContentForPracticeArea.result && this.homeContent.homePageContentForPracticeArea.result.newsgroups) {
                this.breakingNews = this.homeContent.homePageContentForPracticeArea.result.newsgroups.find(ng => ng.title == 'Breaking news');
            } else {
                this.breakingNews = this.homeContent.homePageContentForPracticeArea.newsgroups;
            }
  
            if (this.homeContent.homePageContentForPracticeArea.result && this.homeContent.homePageContentForPracticeArea.result.newsgroups) {
                this.recentCases = this.homeContent.homePageContentForPracticeArea.result.newsgroups.find(ng => ng.title == 'Recent cases');
            } else {
                //this.recentCases = this.homeContent.homePageContentForPracticeArea.newsgroups.find(ng => ng.title == 'Recent cases');
            }
  
            if (this.homeContent.homePageContentForrecentlyViewed.result) {
                this.recentlyViewed = this.homeContent.homePageContentForrecentlyViewed.result;
            } else {
                this.recentlyViewed = this.homeContent.homePageContentForrecentlyViewed;
            }
  
  
            if (this.homeContent.homePageContentForSubTopic.result && this.homeContent.homePageContentForSubTopic.result["forms & precedents"] != null) {
                this.essentialComponent.getEssentials(this.homeContent.homePageContentForSubTopic.result["forms & precedents"], "Forms & Precedents", guidance);
            } else {
                this.essentialComponent.getEssentials(this.homeContent.homePageContentForSubTopic["forms & precedents"], "Forms & Precedents", guidance);
            }
  
            if (this.homeContent.homePageContentForSubTopic.result && this.homeContent.homePageContentForSubTopic.result["checklists"] != null) {
                this.essentialComponent.getEssentials(this.homeContent.homePageContentForSubTopic.result["checklists"], "Checklists", guidance);
            } else {
                this.essentialComponent.getEssentials(this.homeContent.homePageContentForSubTopic["checklists"], "Checklists", guidance);
            }
  
            if (this.homeContent.homePageContentForSubTopic.result && this.homeContent.homePageContentForSubTopic.result["other resources"] != null) {
                this.essentialComponent.getEssentials(this.homeContent.homePageContentForSubTopic.result["other resources"], "Other Resources", guidance);
            } else {
                this.essentialComponent.getEssentials(this.homeContent.homePageContentForSubTopic["other resources"], "Other Resources", guidance);
            }
  
        });*/
    }

    navigateToGuidanceNote(subtopic: TocItemViewModel) {
        this.setSelectedSubTopic(subtopic);
        var input = { "subTopicDomainPath": subtopic.domainPath, "title": this.practiceArea + " > " + subtopic.title, "practiceArea": subtopic.title, rootArea: this.practiceArea, "subTopic": subtopic };
        this._dataStoreService.setSessionStorageItem("guidanceNote", input);
        this._navigationService.isNavigationSubTopic = true;
        this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
    }

    downloadContent(data) {
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        if (selectedPracticeArea.isSubscribed) {
            this.rendrContentRequest.dpath = data.domainPath;
            this.rendrContentRequest.hasChildren = (data.hasChildren) ? "true" : "false";
            var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            var regex = new RegExp(expression);
            if (regex.test(data.domainPath)) {
                window.open(data.domainPath);
            } else {
                this._contentService.getPDFStream(this.rendrContentRequest.dpath.split("/").pop()).subscribe(data => {
                    if (data) {
                        let TYPED_ARRAY = new Uint8Array(data);

                        const STRING_CHAR = TYPED_ARRAY.reduce((strData, byte) => {
                            return strData + String.fromCharCode(byte);
                        }, '');
                        let base64String = btoa(STRING_CHAR);
                        this.isPDF = true;
                        this.pdfContent = "data:application/pdf,base64;"+base64String;
                    }
                    if (data.mimeType == "application/pdf" && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                        this.isPDF = true;
                        //this.pdfTitle = data.fileName.replace(".pdf", '');
                        this.pdfContent = data;//PgConstants.constants.WEBAPIURLS.GetPdfStream + this.rendrContentRequest.dpath.split("/").pop();
                    } else {
                        //this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
                    }
                });
                //this._contentService.downloadContent(this.rendrContentRequest).subscribe(data => {
                //    if (data.mimeType == "application/pdf" && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                //        this.isPDF = true;
                //        this.pdfTitle = data.fileName.replace(".pdf", '');
                //        this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + this.rendrContentRequest.dpath.split("/").pop();
                //    } else {
                //        this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
                //    }
                //});
            }

        }
        else
            this._modalService.open();
    }


    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    setSelectedSubTopic(subTopic) {
        this._dataStoreService.setSessionStorageItem("SelectedSubTopic", subTopic);
    }

    onRecentlyViewClick(recentlyview) {
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        if (selectedPracticeArea.isSubscribed) {
            this._contentService.navigateToContent(recentlyview);
        }
        else
            this._modalService.open();
    }



    onViewAllClick() {
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        this._navigationService.navigate(PgConstants.constants.URLS.History.HistoryList, null);
    }

    getWhatsNew(input) {
        this._whatsNewService.getWhatsNew(input).subscribe(data => {
            this.news = data;
        });
        //this._whatsNewService.getAllLatestWhatsNew(input).subscribe(data => {
        //    this.news = data;
        //});
    }

    getEssential() {

        var subTopics = [];
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");

        selectedPracticeArea.subTocItem.forEach(s => {
            subTopics.push(s);
        });

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

    getRecentlyView() {
        this._historyService.getHistoryItemsByCount(5).subscribe(data => {
            if (data && data != undefined && data != null && data.length > 0 && data[0].isValid)
                data.forEach(hItem => {
                    if (hItem.lmtTitlePath) {
                        let titlePath = hItem.lmtTitlePath;
                        hItem.lmtTitlePath = (titlePath.split('|')).length > 3 ? titlePath.split('|')[2] : titlePath.split('|')[1];
                        if (titlePath && titlePath.includes("Income Tax")) {
                            hItem.lmtTitlePath = "Tax - " + hItem.lmtTitlePath;
                        } else if (titlePath && titlePath.includes("Real Estate")) {
                            hItem.lmtTitlePath = "Real Estate - " + hItem.lmtTitlePath;
                        }
                    }
                });
            this.recentlyViewed = data;
        });
    }

    backToSubTopic() {
        this.isPDF = false;
        this.pdfContent = "";
        this.pdfTitle = "";
    }

    getSubTopics(selectedPracticeArea) {
        selectedPracticeArea.subTocItem.forEach(topic => {
            topic.subTocItem.forEach(subTopic => {
                //this.subTopics = [...this.subTopics, subTopic];
                this.setSubTopics(subTopic);
            });
        });

    }
    setSubTopics(topic) {
        if (topic.hasChildren && topic.subTocItem != null && topic.subTocItem.length > 0) {
            return topic.subTocItem.map(subTopic => {
                return this.setSubTopics(subTopic);
            });
        } else if (topic.type == "ST") {
            this.catSubTopics = [...this.catSubTopics, topic];
            //this.subTopicsList.push(topic);
            return topic;
        } else {
        }
    }
}
