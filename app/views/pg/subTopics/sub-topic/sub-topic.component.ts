import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SubTopicService } from '../../../../shared/services/sub-topic/sub-topics.service';
import { TocItemViewModel } from '../../../../shared/models/practiceAreas';
import { Subscription } from 'rxjs/Subscription';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { CategoryComponent } from '../category/category.component';
import { EssentialsComponent } from '../../../../shared/components/essentials/essentials.component';
import { ContentService } from '../../../../shared/services/content/content.service';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { PgModalService } from '../../../../shared/services/pg-modal/pg-modal.service';
import { WhatsNewService } from '../../../../shared/services/whats-new/whats-new.service';
import { EssentialService } from '../../../../shared/services/essential/essential-service';
import { HistoryService } from '../../../../shared/services/history/history.service';
import { PracticeAreaService } from '../../../../shared/services/practice-areas/practice-areas.service';
import { PgMessages } from '../../../../shared/constants/messages';
import { PagerService } from '../../../../shared/services/pager/pager.service';

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
    pdfTitle: string = "";
    pdfContent: string = "";
    practiceArea: string;
    paGuidance: string;
    subTopics: TocItemViewModel[] = [];
    catSubTopics: TocItemViewModel[] = [];
    essentials: any[] = [];
    recentlyViewed: any[] = [];
    news: any;
    whatsNewInput: any;

    constructor(
        private _routerProxy: RouterProxy,
        private _navigationService: NavigationService,
        private _contentService: ContentService,
        private _dataStoreService: DataStoreService,
        private _modalService: PgModalService,
        private _whatsNewService: WhatsNewService,
        private _essentialService: EssentialService,
        private _historyService: HistoryService,
        private _practiceAreaService: PracticeAreaService,
        private _pagerService: PagerService
    ) {
    }

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

                this.getContentForSubTopic(viewModel);
                this.whatsNewInput = {
                    "domainPath": viewModel.domainPath, "tocItemType": viewModel.type, "subTopicDomainPath": viewModel.subTocItem[0].subTocItem[0].domainPath, "recordsCount": 9, "pageIndex": 0, "pageSize": 9
                };
                let subTopicDomainPath = "";
                if (viewModel.subTocItem[0].subTocItem[0].type == "ST") {
                    subTopicDomainPath = viewModel.subTocItem[0].subTocItem[0].domainPath;
                } else if (viewModel.subTocItem[0].subTocItem[0].subTocItem[0].type == "ST") {
                    subTopicDomainPath = viewModel.subTocItem[0].subTocItem[0].domainPath;
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
                this._pagerService.setPageView();
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

        this.practiceArea = viewModel.title;
        this.getEssential();
        this.getRecentlyView();
        input.pageSize = 9; // to show watsnew category in 3*3
        this.getWhatsNew(input);
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
            this.rendrContentRequest.dpath = data.subTopicDomainPath;
            this.rendrContentRequest.hasChildren = (data.hasChildren) ? "true" : "false";
            var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            var regex = new RegExp(expression);
            if (regex.test(data.domainPath)) {
                window.open(data.domainPath);
            } else {
                if (data.mimeType.indexOf("pdf") != -1 && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                    this.isPDF = true;
                    this.pdfTitle = data.title;
                    this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + this.rendrContentRequest.dpath.split("/").pop();
                    this._pagerService.setPageView();
                } else {
                    this._contentService.downloadContent(this.rendrContentRequest).subscribe(file => {
                        this._contentService.downloadattachment(file.fileContent, file.fileName, file.mimeType);
                    });
                }
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
        this._navigationService.navigate(PgConstants.constants.URLS.History.HistoryList, null);
    }

    getWhatsNew(input) {
        this._whatsNewService.getWhatsNew(input).subscribe(data => {
            this.news = data;
        });
    }

    getEssential() {
        var subTopics = [];
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

    getRecentlyView() {
        this._historyService.getHistoryItemsByCount(5).subscribe(data => {
            if (data && data != undefined && data != null && data.length > 0 && data[0].isValid) {
                data.forEach(hItem => {
                    if (hItem.lmtTitlePath) {
                        let titlePath = hItem.lmtTitlePath;
                        hItem.lmtTitlePath = (titlePath.split('|')).length > 3 ? titlePath.split('|')[2] : titlePath.split('|')[1];
                        if (titlePath.includes("Income Tax")) {
                            hItem.lmtTitlePath = "Tax - " + hItem.lmtTitlePath;
                        } else if (titlePath.includes("Real Estate")) {
                            hItem.lmtTitlePath = "Real Estate - " + hItem.lmtTitlePath;
                        }
                    }
                });
                this.recentlyViewed = data;
            } else {
                this.recentlyViewed = [];
                //this.recentlyViewed = (Array.isArray(history) && history.length == 0) ? PgMessages.constants.history.noHistory : PgMessages.constants.history.error;
            }
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
            return topic;
        } else {
        }
    }
}
