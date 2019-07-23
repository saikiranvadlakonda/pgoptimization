import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEntryModel, NavigationElementModel, SearchParameters, searchedParameters } from '../../../../shared/models/search';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { ErrorModalService } from '../../../../shared/services/error-modal/error-modal.service';
import { ErrorContent } from '../../../../shared/models/error-content/error-content.model';
import { PgMessages } from '../../../../shared/constants/messages';

@Component({
    selector: 'search-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnInit {

    _navigationEntries: NavigationEntryModel[];
    practiceAreas: NavigationElementModel[];
    topics: NavigationElementModel[];
    subTopics: NavigationElementModel[];
    documentTypes: NavigationElementModel[];

    practiceAreaLength: number = 4;
    topicLength: number = 4;
    subTopicLength: number = 4;
    documentTypeLength: number = 4;

    selectedpracticeAreas: NavigationElementModel[] = [];
    selectedtopics: NavigationElementModel[] = [];
    selectedsubTopics: NavigationElementModel[] = [];
    selecteddocumentTypes: NavigationElementModel[] = [];
    showLessPracticeAreas: boolean = false;showLessTopics: boolean = false; showLessSubTopics: boolean = false; showLessDocuments: boolean = false;
    searchParams: SearchParameters;
    searchText: string = '';
    narrowSearchTerms: string = '';
    filterByTopics: boolean = false;
    filterByDOCT: boolean = false;
    filterByPA: boolean = false;
    filterBySWINSR: boolean = false;
    @Input() isCollapsed;
    @Output() isCollapsedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input()
    set navigationEntries(_navigationEntries: NavigationEntryModel[]) {
        this.preFilters(_navigationEntries);
    }
    get navigationEntries(): NavigationEntryModel[] {
        return this._navigationEntries;
    }
    filters: string = '';
    appliedFilters: any = {};

    _searchedParameters: searchedParameters;
    @Input()
    set searchedParameters(_searchedParameters: searchedParameters) {
        this.searchText = _searchedParameters.originalNarrowSearchTerm;        
    }

    @Output() narrowSearchWithinResults: EventEmitter<any> = new EventEmitter<any>();
    @Output() searchBySelectedData: EventEmitter<string> = new EventEmitter<string>();

    constructor(private _dataStoreService: DataStoreService, private _errorModalService: ErrorModalService) { }

    ngOnInit() {
    }

    preFilters(filters: NavigationEntryModel[]) {
        if (filters.length == 0) return;
        this.topics = filters.find(f => f.name == 'topic').navigationElements;
        this.subTopics = filters.find(f => f.name == 'subtopic').navigationElements;
        this.documentTypes = filters.find(f => f.name == 'lndocumenttypes').navigationElements;

        if (this.selectedsubTopics.length>0 && this.subTopics) {           
            this.fillCheckBox(this.selectedsubTopics,this.subTopics);
        }

        if (this.selectedtopics.length>0 && this.topics) {
            this.fillCheckBox(this.selectedtopics,this.topics);
        }
        
        if (this.selecteddocumentTypes.length>0 && this.documentTypes) {
            this.fillCheckBox(this.selecteddocumentTypes,this.documentTypes);
        }

        this.practiceAreas = this._dataStoreService.getSessionStorageItem("practiceAreaPrefilters");
        if (this.practiceAreas && this.selectedpracticeAreas.length > 0) {
            this.fillCheckBox(this.selectedpracticeAreas,this.practiceAreas);
        }
    }

    fillCheckBox(selectedData,data){
        selectedData.forEach(ssT => {
            if (data.find(pa => ssT.displayName == pa.displayName)) {
                data.find(pa => ssT.displayName == pa.displayName).isSelected = true;
            }
        });
    }   

    showMore(dataLength,data,showLess,type){
        dataLength = dataLength + 5;
        if (data.length <= dataLength) {
            showLess = true;
        }

        if(type =="PA"){
            this.practiceAreaLength = dataLength;
            this.showLessPracticeAreas = showLess;
        }else if(type =="topic"){
            this.topicLength = dataLength;
            this.showLessTopics = showLess;
        }else if(type =="subTopic"){
            this.subTopicLength = dataLength;
            this.showLessSubTopics = showLess;
        }else if(type =="document"){
            this.documentTypeLength = dataLength;
            this.showLessDocuments = showLess;
        }
    }

    showLess(type) {
        if(type =="PA"){
            this.showLessPracticeAreas = false;
            this.practiceAreaLength = 5;
        }else if(type =="topic"){
            this.showLessTopics = false;
            this.topicLength  = 5;
        }else if(type =="subTopic"){
            this.showLessSubTopics = false;
            this.subTopicLength = 5;
        }else if(type =="document"){
            this.showLessDocuments = false;
            this.documentTypeLength = 5;
        }
    }

    practiceAreaClick(checked, practicearea: NavigationElementModel) {
        var practiceAreaFilter = '';
        if (checked)
            this.selectedpracticeAreas.push(practicearea);
        else {
            let paIndex = 0;
            this.selectedpracticeAreas.forEach((spa, ind) => {
                if (practicearea.displayName == spa.displayName) {
                    paIndex = ind;
                }
            });
            this.selectedpracticeAreas.splice(paIndex, 1);
        }        
    }

    practiceAreaClickFilter(checked, practicearea: NavigationElementModel) {        
        this.constructSearchString(checked,this.selectedpracticeAreas,practicearea);
    }

    topicClick(checked, topic: NavigationElementModel) {
        this.constructSearchString(checked,this.selectedtopics,topic);
    }

    subTopicClick(checked, subTopic: NavigationElementModel) {        
        this.constructSearchString(checked,this.selectedsubTopics,subTopic);
    }

    documentTypeClick(checked, documentType: NavigationElementModel) {
       this.constructSearchString(checked,this.selecteddocumentTypes,documentType);
    }

    constructSearchString(checked,selectedData,data){
        if (checked)
            selectedData.push(data);
        else
            selectedData.splice(selectedData.indexOf(data), 1);
        this.reMapSearchFilters();
    }

    setSearchParameters() {
        this.searchParams = this._dataStoreService.getSessionStorageItem('SearchParameter');
        if (this.searchParams == null) {
            this.searchParams = new SearchParameters();
        }
        this.searchParams.Filters = this.filters;
        this.searchParams.NarrowSearchTerms = this.narrowSearchTerms;
        this._dataStoreService.setSessionStorageItem('SearchParameter', this.searchParams);
        this._dataStoreService.setSearchParamter(this.searchParams);
    }

    searchWithinResults() {
        if (this.searchText == "" || this.searchText == undefined) {
            let errorMsg = new ErrorContent();
            errorMsg.message = PgMessages.constants.search.narrowSearchAlert;
            errorMsg.showOk = true;
            this._errorModalService.open(errorMsg);
        } else {
            if (this.narrowSearchTerms == '')
                this.narrowSearchTerms = this.searchText + '!' + this.searchText;
            else
                this.narrowSearchTerms = this.narrowSearchTerms + '~' + this.searchText + '!' + this.searchText;
            this.narrowSearchWithinResults.emit({ "narrowSearchTerms": this.narrowSearchTerms, "originalNarrowText": this.searchText });

            this.collapseSearch();
        }
    }
    clearAllFilters() {
        this.filters = "";
        this.selectedpracticeAreas = [];
        this.selectedsubTopics = [];
        this.selecteddocumentTypes = [];
        this.selectedtopics = [];
        this.setSearchParameters();
        this.searchBySelectedData.emit(this.filters);
    }

    reMapSearchFilters() {
        this.filters = '';
        var practiceAreaFilter = '';
        var documentTypeFilter = '';
        var subTopicFilter = '';
        var topicFilter = '';

        if (this.selectedpracticeAreas.length > 0) {
            practiceAreaFilter = this.selectedpracticeAreas.map(x => x.displayName + ' !' + x.displayName + '[FTS]practicearea').join('~');
            this.filters = practiceAreaFilter;
        }
        if (this.selecteddocumentTypes.length > 0) {
            documentTypeFilter = this.selecteddocumentTypes.map(x => x.displayName + ' !' + x.displayName + '[FTS]lndocumenttypes').join('~');
            if (this.filters != '')
                this.filters = this.filters + '[AND]' + documentTypeFilter;
            else
                this.filters = documentTypeFilter;
        }

        if (this.selectedtopics.length > 0) {
            topicFilter = this.selectedtopics.map(x => x.displayName + '!' + x.displayName + '[FTS]topic').join('~');
            if (this.filters != '')
                this.filters = this.filters + '[AND]' + topicFilter;
            else
                this.filters = topicFilter;
        }
        if (this.selectedsubTopics.length > 0) {
            subTopicFilter = this.selectedsubTopics.map(x => x.displayName + ' !' + x.displayName + '[FTS]subtopic').join('~');
            if (this.filters != '')
                this.filters = this.filters + '[AND]' + subTopicFilter;
            else
                this.filters = subTopicFilter;
        }
        this.searchBySelectedData.emit(this.filters);
    }
    practiceAreaClickSearch() {
        this.reMapSearchFilters();
    }

    clearWithinSearch() {
        this.narrowSearchTerms = '';
        this.searchText = '';
        this.narrowSearchWithinResults.emit({ "narrowSearchTerms": this.narrowSearchTerms, "originalNarrowText": this.searchText });
    }
    
    expandOrMinimizeFbyT() {
        if (this.filterByTopics) {
            this.filterByTopics = false;
        } else {
            this.filterByTopics = true;
        }
    }
    expandOrMinimizeFbyPA() {
        if (this.filterByPA) {
            this.filterByPA = false;
        } else {
            this.filterByPA = true;
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
        this.practiceAreaClickSearch();
        this.isCollapsedChange.emit(false);
    }
}