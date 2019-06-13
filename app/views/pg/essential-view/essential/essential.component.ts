import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { EssentialService } from '../../../../shared/services/essential/essential-service';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { TocItemViewModel } from '../../../../shared/models/practiceAreas';
import { Essential, Topic, ContentDomainEntity } from '../../../../shared/models/essential';
import { ContentService } from '../../../../shared/services/content/content.service';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FilterByPropertyPipe } from '../../../../shared/pipes/filter-by-property/filter-by-property.pipe';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { SafePipe } from '../../../../shared/pipes/safe/safe.pipe';
import { PgMessages } from '../../../../shared/constants/messages';
import { ErrorContent } from '../../../../shared/models/error-content/error-content.model';
import { ErrorModalService } from '../../../../shared/services/error-modal/error-modal.service';
import { PagerService } from '../../../../shared/services/pager/pager.service';

@Component({
    selector: 'app-essential',
    templateUrl: './essential.component.html',
    styleUrls: ['./essential.component.css']
})
export class EssentialComponent implements OnInit {

    constructor(private _essentialService: EssentialService,
        private _dataStoreService: DataStoreService,
        private modalService: BsModalService,
        private _contentService: ContentService,
        private _filterByPropertyPipe: FilterByPropertyPipe,
        private _navigationService: NavigationService,
        private _errorModalService: ErrorModalService,
        private _pagerService: PagerService
    ) { }

    subTopics: TocItemViewModel[];
    isPDF: boolean = false; pdfContent: any; pdfTitle: string = "";
    topic: TocItemViewModel;
    essentials;
    filteredEssentials: any[];
    essentialsList: Essential[];
    curPage: number = 1;
    pageSize: number = 10;
    startEssentialIndex: number;
    selectedEssentialElements: string[] = [];
    selectedPracticeArea;
    selectedSubTopic;
    topics: Topic[];
    pages;
    searchEssential: string;
    rendrContentRequest: RenderContentRequest = new RenderContentRequest();
    checkedEssential: ContentDomainEntity[] = [];
    fileTitle: string = ''; fileFormat: any; downloadPath: string = "";
    isValidFileTitle: boolean = true;
    downloadModalRef: BsModalRef;
    documentType = [
        { name: "forms & precedents", displayName: "Forms and Precedents", isSelected: false, count: 0 },
        { name: "checklists", displayName: "Check Lists", isSelected: false, count: 0 },
        { name: "other resources", displayName: "Other Resources", isSelected: false, count: 0 }
    ];

    isTopicSelected: boolean = true;
    selectedDocumentType;
    error: string;
    pgMessages: any = PgMessages.constants;
    loadFolders: boolean = false;
    saveToFolderContent;
    modalAlertRef: BsModalRef;
    modalRef: BsModalRef;
    filterByTopics: boolean = false;
    filterByDOCT: boolean = false;
    filterBySWINSR: boolean = false;
    isCollapsedChange: boolean = true;

    @ViewChild('modalContent') modalContent: TemplateRef<any>;
    @ViewChild('modalContentAlert') modalContentAlert: TemplateRef<any>;
    ngOnInit() {
        this.subTopics = [];
        this.selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");

        this.selectedPracticeArea.subTocItem.forEach(s => {
            this.subTopics.push(s);
        });
        this.setStartEssentialIndex();
        this.getAllEssentials(true);
        this.selectedDocumentType = ["forms & precedents", "checklists", "other resources"];
        this.scrollTop();//window.scrollTo(0, 0);
    }

    setStartEssentialIndex() {
        this.startEssentialIndex = (this.curPage * this.pageSize) - this.pageSize;
    }

    getAllEssentials(isLoadTopicsCount: boolean = false) {
        this._essentialService.getAllEssential(this.subTopics).subscribe((essentials: any) => {
            if (essentials && essentials.length > 0) {
                if (essentials[0].isValid) {
                    this.essentialsList = essentials;
                    this.setEssentialData(this.essentialsList);
                    if (isLoadTopicsCount)
                        this.getTopics();
                    this.error = undefined;
                } else {
                    this.essentialsList = [];
                    this.setEssentialData(this.essentialsList);
                    this.error = PgMessages.constants.essentials.error;
                }
            } else {
                this.essentialsList = [];
                this.setEssentialData(this.essentialsList);
                this.error = (Array.isArray(essentials)) ? PgMessages.constants.essentials.noEssentials : PgMessages.constants.essentials.error;
            }
            this.scrollTop();//window.scrollTo(0, 0);
        });
    }


    setEssentialData(topics, setDocumentTypeChecked: boolean = true) {
        this.essentials = [];
        if (topics) {
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

            //this.setTopicChecked(topics);
            if (setDocumentTypeChecked)
                this.getDocumentTypeCount(topics, setDocumentTypeChecked);
            this.updatePagination();
        }
    }

    onSearchQueryEnter(event: any): void {
        if (event.keyCode == 13) {
            this.updatePagination();
        }
    }

    updatePagination(): void {
        this.setToPage(1);
        this.pages = Array.from(new Array(this.numberOfPages()), (val, index) => index + 1);
    }

    numberOfPages(): number {
        let filteredEssentials = this._filterByPropertyPipe.transform(this.essentials, this.searchEssential, 'title');
        this.filteredEssentials = filteredEssentials;
        this.checkedEssential = [];
        this.unSelectAllEssentials();
        return Math.ceil(filteredEssentials.length / this.pageSize);
    };

    getNumberOfPages(): number {
        return Math.ceil(this.filteredEssentials.length / this.pageSize);
    }

    onPageSizeChange(size) {
        this.pageSize = size;
        this.curPage = 1;
        this.setStartEssentialIndex();
        this.pages = Array.from(new Array(this.numberOfPages()), (val, index) => index + 1);
        this.scrollTop();//window.scrollTo(0, 0);
    }

    get displayingCount(): number {
        if (this.curPage == this.getNumberOfPages()) {
            return (this.filteredEssentials.length % this.pageSize == 0) ? this.pageSize : this.filteredEssentials.length % this.pageSize;
        } else {
            return (this.filteredEssentials.length != 0) ? this.pageSize : this.filteredEssentials.length;
        }
    }

    loadPreviousPage() {
        if (this.curPage > 1) {
            this.curPage--;
            this.scrollTop();
            this.setToPage(this.curPage);
        }
    }

    loadNextPage() {
        if (this.curPage != this.numberOfPages()) {
            this.curPage++;
            this.scrollTop();
            this.setToPage(this.curPage);
        }
    }

    getTopics() {
        this.topics = [];
        this.selectedPracticeArea.subTocItem.forEach(t => {
            this.topics.push({ title: t.title, isSelected: true, count: this.getEssentialCount(t.title) });
        });
    }

    getEssentialCount(topicName: string) {
        var count = 0;
        var topics = this.essentialsList.filter(s => s.topicName.toLowerCase() == topicName.toLowerCase());
        topics.forEach(t => {
            if (t.essentials) {
                t.essentials.forEach(e => {
                    count = count + e.subContentDomains.length;
                });
            }
        });
        return count;
    }

    getDocumentTypeCount(data, setDocumentTypeChecked) {
        this.documentType.forEach(dt => {
            var count = 0;
            var topics = this.essentialsList.filter(s => s.pageType.toLowerCase() == dt.name.toLowerCase());
            topics.forEach(t => {
                if (t.essentials) {
                    t.essentials.forEach(e => {
                        count = count + e.subContentDomains.length;
                    });
                }
            });
            dt.count = count;
            if (setDocumentTypeChecked) {
                if (dt.count > 0)
                    dt.isSelected = true;
                else
                    dt.isSelected = false;
            }
        });
    }

    setTopicChecked(topics) {
        let uniqueTopics = topics.reduce((x, y) => x.findIndex(e => e.title == y.title) < 0 ? [...x, y] : x, [])
        uniqueTopics.forEach(tp => {
            this.topics.find(t => t.title == tp.topicName).isSelected = true;
        })
    }

    setDocumentType(name: string, checked) {
        this.documentType.find(n => n.name.toLowerCase() == name.toLowerCase()).isSelected = checked;
        var filteredEssentialList = [];
        this.documentType.forEach(d => {
            if (d.isSelected) {
                var eFiltered = this.essentialsList.filter(e => e.pageType.toLowerCase() == d.name.toLowerCase());
                if (eFiltered) {
                    eFiltered.forEach(ef => { filteredEssentialList.push(ef); });
                }
            }
        });

        this.setEssentialData(filteredEssentialList, false);
    }

    setAllDocumentType() {
        var filteredEssentialList = [];
        this.documentType.forEach(d => {
            d.isSelected = true;
            var eFiltered = this.essentialsList.filter(e => e.pageType.toLowerCase() == d.name.toLowerCase());
            if (eFiltered) {
                eFiltered.forEach(ef => { filteredEssentialList.push(ef); });
            }
        });
        this.setEssentialData(filteredEssentialList, false);
    }

    setSeletedTopic(title: string, checked: boolean) {
        this.topics.find(t => t.title == title).isSelected = checked;
        this.isTopicSelected = true;
    }

    SelectAllTopics() {
        this.topics = this.topics.map(t => {
            t.isSelected = true;
            return t;
        });
        this.isTopicSelected = true;
    }

    getEssentialsForSelectedTopics() {
        this.subTopics = [];
        this.topics.forEach(t => {
            if (t.isSelected) {
                var topic = (this.selectedPracticeArea.subTocItem.find(s => s.title == t.title));
                this.subTopics.push(topic);
            }
        });
        this.getAllEssentials();
        this.collapseSearch();
    }

    clearAllTopics() {
        this.topics = this.topics.map(t => {
            t.isSelected = false;
            return t;
        });
        /*this.selectedPracticeArea.subTocItem.forEach(s => {
            this.subTopics.push(s);
        });
        this.getAllEssentials();*/
        this.isTopicSelected = false;
    }

    downLoadContent(domainpath, hasChildren, forceDownload = false) {
        this.rendrContentRequest.dpath = domainpath;
        this.rendrContentRequest.hasChildren = hasChildren;
        this._contentService.downloadContent(this.rendrContentRequest).subscribe(data => {
            if (data !== null) {
                if (data.mimeType == "application/pdf" && !forceDownload && navigator.userAgent.toLowerCase().indexOf("mobile") == -1) {
                    this.isPDF = true;
                    this.pdfTitle = data.fileName ? data.fileName.replace(".pdf", '') : '';
                    this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + this.rendrContentRequest.dpath.split("/").pop();
                    this.scrollTop();
                } else {
                    this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
                }
            } else {
                if (!this._errorModalService.isModalOpened()) {
                    let modalData: ErrorContent = {
                        message: PgMessages.constants.essentials.downloadError,
                        showOk: true,
                        showCancel: false,
                        callBack: undefined
                    };
                    this._errorModalService.open(modalData);
                }
            }
        });

        this.checkedEssential = [];
        this.unSelectAllEssentials();
    }

    openModal(template: TemplateRef<any>, essential) {
        var content = { "title": essential.title, "url": essential.domainPath, "searchResult": null };
        this.saveToFolderContent = JSON.parse(JSON.stringify(content));
        this.getFoldersAll(template);
    }

    openModalMultiEssentials(template: TemplateRef<any>) {
        if (!this.checkedEssential || this.checkedEssential.length == 0) {
            this.modalAlertRef = this.modalService.show(this.modalContentAlert, { backdrop: 'static', keyboard: false });
        } else {
            var content = { "title": "", "url": "", "searchResult": null, "essentialResult": this.checkedEssential };
            content.title = this.checkedEssential.map(d => { return d.title; }).toLocaleString();
            this.saveToFolderContent = JSON.parse(JSON.stringify(content));
            this.getFoldersAll(template);
        }
    }


    getFoldersAll(template) {
        this.loadFolders = true;
        this.modalRef = this.modalService.show(template, { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false });
    }

    onPopUpCloseClick(isSaved) {
        if (isSaved) {
            this.checkedEssential = [];
            this.unSelectAllEssentials();
        }
        this.modalRef.hide();
    }

    addToDownloadQueue(essentialElementId: string, result: any): void {
        (<HTMLInputElement>document.getElementById(essentialElementId)).checked = true;
        this.essentialChecked(true, result, true);
    }

    essentialChecked(isChecked, result, isCallFromAddToDownload) {
        if (isCallFromAddToDownload && result.isChecked)
            return;

        if (!this.checkedEssential)
            this.checkedEssential = [];

        if (isChecked) {
            this.checkedEssential.push(result);
            this.filteredEssentials[this.filteredEssentials.findIndex(s => s == result)]['isChecked'] = true;
        } else {
            this.checkedEssential.splice(this.checkedEssential.findIndex(s => s == result), 1);
            this.filteredEssentials[this.filteredEssentials.findIndex(s => s == result)]['isChecked'] = false;
        }
    }

    openTab(essential) {
        if (essential.domainPath.indexOf("http") == 0) {
            window.open(essential.domainPath);
        }

        this.checkedEssential = [];
        this.unSelectAllEssentials();
    }

    essentialsList1 = [{ "topicName": "Legal and compliance", "subTopicName": "Establishing compliance", "pageType": "forms & precedents", "essentials": [{ "parentDomainId": null, "domainId": null, "title": "Establishing a compliance function", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Compliance charter", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/sp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Compliance charter training strategy", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/rp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Compliance policy and procedure", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/tp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "The content structure of the compliance charter  ", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Sample authority clause ", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/qhzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Sample scope clause", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/uhzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Risk management methodology clause ", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/thzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Sample reporting clause ", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/shzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Sample implementation clause", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/rhzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Compliance charter", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/sp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Compliance charter training strategy", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/rp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Compliance policy and procedure", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/tp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Risk", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Compliance charter training strategy", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/rp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "How to draft policies procedures and training strategies", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Compliance policy and procedure", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/tp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Compliance charter training strategy", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/rp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Compliance charter", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/sp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Policy or procedure application form", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/up9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Acknowledgement of understanding sample clause", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/qp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Survey on policies and training", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/c7yle/vp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }] }, { "topicName": "Legal and compliance", "subTopicName": "Legal", "pageType": "forms & precedents", "essentials": [{ "parentDomainId": null, "domainId": null, "title": "Legal department standards ", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Legal department policy and procedure ", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/0p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Legal department training strategy", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/1p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Satisfaction survey", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/3p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Example of a request form", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/zp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Standards of the legal department", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/4p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Dealing with requests ", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Legal department policy and procedure", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/0p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Dealing with requests sample clause", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/yp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Example of a request form", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/zp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Satisfaction survey", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/3p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Legal department training strategy", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/1p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Sample legal standards clause", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/iqjne", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Contract drafting and signing", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Legal department policy and procedure", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/0p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Reporting clause", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/2p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "The contract register", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Contract register and contract management systems", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/xp9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Legal department policy and procedure", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/0p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Legal department training strategy", "isSubscribed": false, "domainPath": "7psvc/46yle/66yle/86yle/wp9me/1p9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }] }, { "topicName": "Legal and compliance", "subTopicName": "Establishing compliance", "pageType": "checklists", "essentials": null }, { "topicName": "Legal and compliance", "subTopicName": "Legal", "pageType": "checklists", "essentials": null }, { "topicName": "Legal and compliance", "subTopicName": "Establishing compliance", "pageType": "other resources", "essentials": [{ "parentDomainId": null, "domainId": null, "title": "Establishing a compliance function", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Example of an organogram ", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/1hzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Example of a risk matrix", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/2hzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Compliance function structure", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/0hzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Example of a compliance risk profile", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/jr9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Implementation plan guidelines", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/kr9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Compliance function summary", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/krjne", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "The content structure of the compliance charter  ", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Example of an organogram ", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/1hzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Compliance function structure ", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/0hzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Implementation plan guidelines", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/kr9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Risk", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Example of a risk matrix", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/2hzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "How to draft policies procedures and training strategies", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Implementation plan guidelines", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/g7yle/kr9me", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }] }, { "topicName": "Legal and compliance", "subTopicName": "Legal", "pageType": "other resources", "essentials": [{ "parentDomainId": null, "domainId": null, "title": "Legal department standards ", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Code of Conduct for Legal Practitioners", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/h7yle/3hzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "Contract drafting and signing", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Contract register", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/h7yle/rjzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }, { "parentDomainId": null, "domainId": null, "title": "The contract register", "isSubscribed": false, "domainPath": null, "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": [{ "parentDomainId": null, "domainId": null, "title": "Contract register", "isSubscribed": false, "domainPath": "7psvc/46yle/76yle/f7yle/h7yle/rjzle", "hasChildren": false, "hasModule": false, "topicType": null, "zoneId": 0, "subscriberId": 0, "contentLevel": 0, "rawContent": null, "mimeType": null, "returnOrphan": false, "domainIdList": null, "subContentDomains": null, "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }], "contentFilePath": null, "contentUsername": null, "contentPassword": null, "isValid": true, "suggestionString": null, "message": null, "resultType": 0 }] }]


    openFileDownloadModal(template: TemplateRef<any>) {
        //this.fileTitle = this.practiceArea;
        if (!this.checkedEssential || this.checkedEssential.length == 0) {
            this.modalAlertRef = this.modalService.show(this.modalContentAlert, { backdrop: 'static', keyboard: false });
            //alert("Please make a selection");
        } else {
            var content = { "title": "", "url": "", "searchResult": null, "essentialResult": this.checkedEssential };
            content.title = this.checkedEssential.map(d => { return d.title; }).toLocaleString();
            this.checkedEssential.forEach(essential => {
                if (essential.domainPath.indexOf("http") == 0) {
                    this.openTab(essential);
                }
                else {
                    this.downLoadContent(essential.domainPath, essential.hasChildren, true);
                }
            });
            this.checkedEssential = [];
            this.unSelectAllEssentials();
        }
    }

    validate() {
        if (this.checkedEssential.length > 0 && this.fileTitle != undefined && this.fileTitle != null && this.fileTitle.trim() != '') {
            this.checkedEssential.forEach;
            this.isValidFileTitle = true;
            var fileData = new RenderContentRequest();
            fileData.downloadContent = "true";
            fileData.dpath = this.downloadPath;//this.viewModel.subTopicDomainPath;
            fileData.title = this.fileTitle;
            fileData.fileFormat = this.fileFormat;
            this.downloadModalRef.hide();
            this._contentService.GetContent(fileData).subscribe(data => {
                if (data !== null) {
                    this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
                }
            });
            this.checkedEssential = [];
            this.unSelectAllEssentials();
        } else {
            this.isValidFileTitle = false;
        }
    }

    closeFileDialog() {
        this.downloadModalRef.hide();
    }

    setToPage(page) {
        this.scrollTop();//window.scrollTo(0, 0);
        this.curPage = page;
        this.setStartEssentialIndex();
    }

    clearSearch(): void {
        this.searchEssential = undefined;
        this.checkedEssential = [];
        this.unSelectAllEssentials();
        this.updatePagination();
    }

    navigateToPracticeAreaSubTopics(): void {
        //this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(this.selectedPracticeArea));
        let previousRoute = this._navigationService.getPreviousRoute();
        this._navigationService.navigate(previousRoute.previousRoute, this._navigationService.getStateParams(previousRoute.previousRoute), undefined, true);
    }

    onSaveToFolderClick(): void {
        this.onPopUpCloseClick(true);
        this.checkedEssential = [];
        this.unSelectAllEssentials();
    }

    unSelectAllEssentials(): void {
        this.filteredEssentials = this.filteredEssentials.map(essential => {
            essential.isChecked = false;
            return essential;
        });
    }

    scrollTop() {
        this._pagerService.setPageView();
        /*
        let scrollEle = document.getElementById('newpg');
        if (window.navigator.userAgent.indexOf("Edge") == -1)
            scrollEle.scrollTo(0, 0);
        else
            scrollEle.scrollTop = 0;
        */
    }

    expandOrMinimizeFbyT() {
        if (this.filterByTopics) {
            this.filterByTopics = false;
        } else {
            this.filterByTopics = true;
        }
    }

    expandOrMinimizeFbyDOCT() {
        if (this.filterByDOCT) {
            this.filterByDOCT = false;
        } else {
            this.filterByDOCT = true;
        }
    }
    expandOrMinimizeSWinSR() {
        if (this.filterBySWINSR) {
            this.filterBySWINSR = false;
        } else {
            this.filterBySWINSR = true;
        }
    }

    collapseSearch() {
        //this.isCollapsedChange.emit(false);
        if (this.isCollapsedChange) {
            this.isCollapsedChange = false;
        } else {
            this.isCollapsedChange = true;
        }
    }
}
