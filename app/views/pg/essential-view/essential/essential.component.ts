import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { EssentialService } from '../../../../shared/services/essential/essential-service';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { TocItemViewModel } from '../../../../shared/models/practiceAreas';
import { Essential, Topic, ContentDomainEntity, EssentialFilters } from '../../../../shared/models/essential';
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
import { SaveToFolderModalComponent } from '../../../../shared/components/save-to-folder-modal/save-to-folder-modal.component';
import { PgAlertModalComponent } from '../../../../shared/components/pg-alert-modal/pg-alert-modal.component';

@Component({
    selector: 'app-essential',
    templateUrl: './essential.component.html',
    styleUrls: ['./essential.component.css']
})
export class EssentialComponent implements OnInit {

    isPDF: boolean = false; pdfContent: any; pdfTitle: string = "";
    filteredEssentials: any[] = [];
    essentialsList: Essential[];
    curPage: number = 1;
    pageSize: number = 10;
    selectedPracticeArea;
    topics: Topic[];
    pages;
    searchEssential: string = '';
    checkedEssential: ContentDomainEntity[] = [];
    fileTitle: string = ''; fileFormat: any; downloadPath: string = "";
    isValidFileTitle: boolean = true;
    downloadModalRef: BsModalRef;
    documentType: any = [
        { name: "forms & precedents", displayName: "Forms and Precedents", isSelected: false, count: 0 },
        { name: "checklists", displayName: "Check Lists", isSelected: false, count: 0 },
        { name: "other resources", displayName: "Other Resources", isSelected: false, count: 0 }
    ];
    totalPages: number = 0;
    error: string;
    pgMessages: any = PgMessages.constants;
    loadFolders: boolean = false;
    saveToFolderContent;
    modalAlertRef: BsModalRef;
    modalRef: BsModalRef;
    isCollapsedChange: boolean = true;
    pgConstants: any = PgConstants.constants;
    pagesCount: number = 0;

    @ViewChild('modalContent') modalContent: TemplateRef<any>;
    @ViewChild('modalContentAlert') modalContentAlert: TemplateRef<any>;
    @ViewChild(SaveToFolderModalComponent) saveToFolderModalComponent: SaveToFolderModalComponent;
    @ViewChild(PgAlertModalComponent) pgAlertModalComponent: PgAlertModalComponent;

    constructor(private _essentialService: EssentialService,
        private _dataStoreService: DataStoreService,
        private modalService: BsModalService,
        private _contentService: ContentService,
        private _filterByPropertyPipe: FilterByPropertyPipe,
        private _navigationService: NavigationService,
        private _errorModalService: ErrorModalService,
        private _pagerService: PagerService
    ) { }

    ngOnInit() {
        this.selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        this.getAllEssentials(true);
        this.scrollTop();
    }



    getAllEssentials(isLoadTopicsCount: boolean = false) {
        let paName = this.selectedPracticeArea.title;
        if (this.selectedPracticeArea.type == "PA-MD") {
            paName = this.selectedPracticeArea.actualTitle;
        }

        this._essentialService.getEssentialsCount({ practiceAreaName: paName }).subscribe(allFilters => {
            let aggrFilters = this._essentialService.aggregateEssentials(allFilters);
            if (aggrFilters.topics != undefined) {
                this.topics = Object.keys(aggrFilters.topics).map(topic => {
                    return { title: topic, isSelected: true, count: aggrFilters.topics[topic]['total'], topic: topic, isTopic: true, topicData: aggrFilters.topics[topic] };
                });
            } else
                this.topics = [];

            if (aggrFilters.documentTypes != undefined) {
                this.documentType = Object.keys(aggrFilters.documentTypes).map(docTitle => {
                    return { title: docTitle, isSelected: true, count: aggrFilters.documentTypes[docTitle], isTopic: false, topic: docTitle };
                });
            } else
                this.documentType = [];

            this._essentialService.getAllEssentialsByPage({ topics: this.topics.concat(this.documentType), page: this.curPage, size: this.pageSize, practiceAreaName: paName }).subscribe((essentials) => {
                if (essentials && essentials.length > 0) {
                    if (essentials[0].isValid) {
                        this.essentialsList = essentials;
                        this.setEssentialData(this.essentialsList);
                        this.error = undefined;
                    } else {
                        this.essentialsList = [];
                        this.error = PgMessages.constants.essentials.error;
                    }
                } else {
                    this.essentialsList = [];
                    this.error = (Array.isArray(essentials)) ? PgMessages.constants.essentials.noEssentials : PgMessages.constants.essentials.error;
                }
                this.scrollTop();
            });
        });
    }


    setEssentialData(topics, setDocumentTypeChecked: boolean = true) {
        this.updatePagination();
    }

    onSearchQueryEnter(searchQuery: string): void {
        this.isCollapsedChange = !this.isCollapsedChange;
        this.updatePagination(searchQuery);
    }

    updatePagination(searchQuery?: string): void {
        if (searchQuery) {
            this.searchEssential = searchQuery;
        } else {
            this.searchEssential = '';
        }
        let eventData: any = {
            page: this.curPage,
            fromNav: false
        };
        this.setToPage(eventData);
        this.pages = Array.from(new Array(this.numberOfPages()), (val, index) => index + 1);
    }

    numberOfPages(): number {
        let filteredEssentials = this._filterByPropertyPipe.transform(this.essentialsList, this.searchEssential, 'title');
        this.filteredEssentials = filteredEssentials;
        if (this.searchEssential != undefined && this.searchEssential != null && this.searchEssential.trim().length == 0) {
            let total = 0;
            this.documentType.forEach(doc => {
                this.topics.forEach(topic => {
                    if (topic.isSelected && doc.isSelected && topic.topicData[doc.title]) {
                        total += topic.topicData[doc.title];
                    }
                });
            });

            this.totalPages = total;
            return Math.ceil(total / this.pageSize);
        }

        this.checkedEssential = [];
        this.unSelectAllEssentials();
        this.pagesCount = Math.ceil(filteredEssentials.length / this.pageSize);
        return this.pagesCount;
    };

    getNumberOfPages(): number {
        return this.numberOfPages();
    }

    onPageSizeChange(size) {
        this.pageSize = size;
        this.curPage = 1;
        let selectedTopics = this.topics.filter(topic => topic.isSelected);
        let paName = this.selectedPracticeArea.title;
        if (this.selectedPracticeArea.type == "PA-MD") {
            paName = this.selectedPracticeArea.actualTitle;
        }
        let input = { topics: selectedTopics.concat(this.documentType.filter(doc => doc.isSelected)), page: this.curPage, size: this.pageSize, practiceAreaName: paName };
        this.fetchEssentials(input);

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
            let eventData: any = {
                page: this.curPage,
                fromNav: true
            };
            this.setToPage(eventData);
        }
    }

    loadNextPage() {
        if (this.curPage != this.numberOfPages()) {
            this.curPage++;
            this.scrollTop();
            let eventData: any = {
                page: this.curPage,
                fromNav: true
            };
            this.setToPage(eventData);
        }
    }

    setDocumentType(eventData: any) {
        this.documentType.find(n => n.title.toLowerCase() == eventData.title.toLowerCase()).isSelected = eventData.isChecked;
        var filteredEssentialList = [];
        this.documentType.forEach(d => {
            if (d.isSelected) {
                var eFiltered = this.essentialsList.filter(e => e.pageType.toLowerCase() == d.title.toLowerCase());
                if (eFiltered) {
                    //eFiltered.forEach(ef => { filteredEssentialList.push(ef); });
                }
            }
        });

    }

    setAllDocumentType() {
        var filteredEssentialList = [];
        this.documentType.forEach(d => {
            d.isSelected = true;
        });
    }

    setSeletedTopic(eventData: any) {
        this.topics.find(t => t.title == eventData.title).isSelected = eventData.isChecked;
    }

    selectAllTopics() {
        this.topics = this.topics.map(t => {
            t.isSelected = true;
            return t;
        });
    }

    getEssentialsForSelectedTopics() {
        this.checkedEssential = [];
        let selectedTopics = this.topics.filter(topic => topic.isSelected);
        let selectedDocTypes = this.documentType.filter(doc => doc.isSelected);
        this.curPage = 1;
        let paName = this.selectedPracticeArea.title;
        if (this.selectedPracticeArea.type == "PA-MD") {
            paName = this.selectedPracticeArea.actualTitle;
        }
        let input = { topics: selectedTopics.concat(selectedDocTypes), page: this.curPage, size: this.pageSize, practiceAreaName: paName };
        this.fetchEssentials(input);
        if (this._pagerService.isMobile)
            this.collapseSearch();
    }

    clearAllTopics() {
        this.topics = this.topics.map(t => {
            t.isSelected = false;
            return t;
        });
    }

    downloadContent(eventData: any) {
        let renderContentRequest: RenderContentRequest = new RenderContentRequest();
        renderContentRequest.dpath = eventData.domainpath ? eventData.domainpath : eventData.subTopicDomainPath;
        renderContentRequest.hasChildren = eventData.hasChildren;
        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        var regex = new RegExp(expression);
        if (regex.test(renderContentRequest.dpath)) {
            window.open(renderContentRequest.dpath);
        } else if (eventData.essential.mimeType == ".pdf" && !eventData.forceDownload && !this._pagerService.isMobile) {
            this.isPDF = true;
            this.pdfTitle = eventData.essential.title ? eventData.essential.title.replace(".pdf", '') : '';
            this.pdfContent = PgConstants.constants.WEBAPIURLS.GetPdfStream + renderContentRequest.dpath.split("/").pop();
            this.scrollTop();
        } else {
            this._contentService.downloadContent(renderContentRequest).subscribe(data => {
                if (data !== null) {
                    this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
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
        }
        

        this.checkedEssential = [];
        this.unSelectAllEssentials();
    }

    openSaveToFolderModal(essential: any): void {
        let content = { "title": essential.title, "url": essential.subTopicDomainPath, "searchResult": null };
        let modalOptions = { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false };
        this.saveToFolderContent = JSON.parse(JSON.stringify(content));
        this.saveToFolderModalComponent.openModal(modalOptions);
    }

    openModalMultiEssentials() {
        if (!this.checkedEssential || this.checkedEssential.length == 0) {
            this.showAlert();
        } else {
            let content = { "title": "", "url": "", "searchResult": null, "essentialResult": this.checkedEssential };
            let modalOptions = { class: 'modal-lg folder-modal', backdrop: 'static', keyboard: false };
            content.title = this.checkedEssential.map(d => { return d.title; }).toLocaleString();
            this.saveToFolderContent = JSON.parse(JSON.stringify(content));
            this.saveToFolderModalComponent.openModal(modalOptions);
        }
    }

    saveFileToFolder(eventData: any): void { }

    onCloseSaveToFolderModal(isSaved: any): void {
        if (isSaved) {
            this.checkedEssential = [];
            this.unSelectAllEssentials();
        }
    }

    addToDownloadQueue(essentialElementId: string, result: any): void {
        (<HTMLInputElement>document.getElementById(essentialElementId)).checked = true;
        let eventData: any = {
            isChecked: true,
            result: result,
            isCallFromAddToDownload: true
        }
        this.essentialChecked(eventData);
    }

    essentialChecked(eventData: any) {
        if (eventData.isCallFromAddToDownload && eventData.result.isChecked)
            return;

        if (!this.checkedEssential)
            this.checkedEssential = [];

        if (eventData.isChecked) {
            this.checkedEssential.push(eventData.result);
            this.filteredEssentials[this.filteredEssentials.findIndex(s => s == eventData.result)]['isChecked'] = true;
        } else {
            this.checkedEssential.splice(this.checkedEssential.findIndex(s => s == eventData.result), 1);
            this.filteredEssentials[this.filteredEssentials.findIndex(s => s == eventData.result)]['isChecked'] = false;
        }
    }

    openTab(essential) {
        var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        var regex = new RegExp(expression);
        if (essential.subTopicDomainPath.indexOf("http") == 0 || regex.test(essential.subTopicDomainPath)) {
            window.open(essential.subTopicDomainPath);
        }

        this.checkedEssential = [];
        this.unSelectAllEssentials();
    }


    openFileDownloadModal() {
        if (!this.checkedEssential || this.checkedEssential.length == 0) {
            this.showAlert();
        } else {
            var content = { "title": "", "url": "", "searchResult": null, "essentialResult": this.checkedEssential };
            content.title = this.checkedEssential.map(d => { return d.title; }).toLocaleString();
            this.checkedEssential.forEach(essential => {
                if (essential.subTopicDomainPath.indexOf("http") == 0) {
                    this.openTab(essential);
                }
                else {
                    let eventData: any = {
                        domainpath: essential.subTopicDomainPath,
                        hasChildren: essential.hasChildren,
                        forceDownload: true
                    };
                    this.downloadContent(eventData);
                
                }
            });
            this.checkedEssential = [];
            this.unSelectAllEssentials();
        }
    }

    validate() {
        if (this.checkedEssential.length > 0 && this.fileTitle != undefined && this.fileTitle != null && this.fileTitle.trim() != '') {
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

    setToPage(eventData: any) {
        if (eventData.fromNav) {
            this.scrollTop();
            this.curPage = eventData.page;
            let selectedTopics = this.topics.filter(topic => topic.isSelected);
            let paName = this.selectedPracticeArea.title;
            if (this.selectedPracticeArea.type == "PA-MD") {
                paName = this.selectedPracticeArea.actualTitle;
            }
            let input = { topics: selectedTopics.concat(this.documentType.filter(doc => doc.isSelected)), page: this.curPage, size: this.pageSize, practiceAreaName: paName };
            this.fetchEssentials(input);
        } else {
            this.scrollTop();
            this.curPage = eventData.page;
        }
    }

    clearSearch(): void {
        this.searchEssential = '';
        this.checkedEssential = [];
        this.unSelectAllEssentials();
        this.updatePagination();
    }

    navigateToPracticeAreaSubTopics(): void {
        let previousRoute = this._navigationService.getPreviousRoute();
        this._navigationService.navigate(previousRoute.previousRoute, this._navigationService.getStateParams(previousRoute.previousRoute), undefined, true);
    }

    unSelectAllEssentials(): void {
        this.filteredEssentials = this.filteredEssentials.map(essential => {
            essential.isChecked = false;
            return essential;
        });
    }

    scrollTop() {
        this._pagerService.setPageView();
    }


    collapseSearch() {
        if (this.isCollapsedChange) {
            this.isCollapsedChange = false;
        } else {
            this.isCollapsedChange = true;
        }
    }

    fetchEssentials(input) {
        this._essentialService.getAllEssentialsByPage(input).subscribe(essentials => {
            if (essentials && essentials.length > 0) {
                if (essentials[0].isValid) {
                    this.essentialsList = essentials;
                    this.filteredEssentials = essentials;
                    if (this.checkedEssential.length > 0) {
                        this.checkedEssential.forEach(chEss => {
                            this.filteredEssentials.filter(ess => ess.title == chEss.title).forEach(ess => {
                                ess.isChecked = true;
                                console.log(ess);
                            });
                        });
                    }
                    this.pages = Array.from(new Array(this.numberOfPages()), (val, index) => index + 1);
                    this.scrollTop();
                    this.error = undefined;
                } else {
                    this.essentialsList = [];
                    this.filteredEssentials = [];
                    this.error = PgMessages.constants.essentials.error;
                }
            } else {
                this.essentialsList = [];
                this.filteredEssentials = [];
                //this.setEssentialData(this.essentialsList);
                this.error = (Array.isArray(essentials)) ? PgMessages.constants.essentials.noEssentials : PgMessages.constants.essentials.error;
            }
        });
    }

    showAlert(): void {
        let modalOptions: any = { backdrop: 'static', keyboard: false };
        let messages: string[] = [];
        messages.push("Please select atleast one essential.");
        this.pgAlertModalComponent.openModal(modalOptions, messages);
    }

    onCloseAlert(): void { }
}
