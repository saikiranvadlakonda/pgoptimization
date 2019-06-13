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
    showLessPracticeAreas: boolean = false; showLessSubTopics: boolean = false; showLessDocuments: boolean = false;
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
        /*this._searchedParameters = _searchedParameters;
        if (!this.searchParams) {
            this.searchParams = new SearchParameters();
        }
        this.searchParams.Filters = _searchedParameters.filters;
        this.searchText = _searchedParameters.originalNarrowSearchTerm;
        var appliedFilters = _searchedParameters.filters;
        if (_searchedParameters.filters != null) {
            if (this.selectedpracticeAreas) {
                this.appliedFilters["selectedpracticeAreas"] = [];
                this.selectedpracticeAreas.forEach(spa => {
                    this.appliedFilters["selectedpracticeAreas"].push(spa);
                });
            }
            //this.appliedFilters["selectedpracticeAreas"] = this.selectedpracticeAreas;
            if (this.selectedsubTopics) {
                this.appliedFilters["selectedsubTopics"] = [];
                this.selectedsubTopics.forEach(spa => {
                    this.appliedFilters["selectedsubTopics"].push(spa);
                });
            }
            //this.appliedFilters["selectedsubTopics"] = this.selectedsubTopics;
            if (this.selecteddocumentTypes) {
                this.appliedFilters["selecteddocumentTypes"] = [];
                this.selecteddocumentTypes.forEach(spa => {
                    this.appliedFilters["selecteddocumentTypes"].push(spa);
                });
            }
            //this.appliedFilters["selecteddocumentTypes"] = this.selecteddocumentTypes;
            
        } else {
            this.filters = "";
            this.appliedFilters["selectedpracticeAreas"] = [];
            this.appliedFilters["selectedsubTopics"] = [];
            this.appliedFilters["selecteddocumentTypes"] = [];
        }
  
        if (this.practiceAreas && this.selectedpracticeAreas && this.searchParams && this.searchParams.Filters != null) {
            this.selectedpracticeAreas.forEach(spA => {
                this.practiceAreas.find(pa => spA.displayName == pa.displayName).isSelected = true;
            });
  
            
        }
  
        if (this.searchParams.Filters.indexOf("[FTS]practicearea") != -1) {
            this.practiceAreas.forEach(pa => {
                if (this.searchParams.Filters.indexOf(pa.name) != -1) {
                }
            });
        }
  
        if (this.searchParams.Filters.indexOf("[FTS]practicearea") != -1) {
  
        }*/
    }


    @Output() selectedPracticeArea: EventEmitter<string> = new EventEmitter<string>();
    @Output() selectedTopic: EventEmitter<string> = new EventEmitter<string>();
    @Output() selectedSubTopic: EventEmitter<string> = new EventEmitter<string>();
    @Output() selectedDocumentType: EventEmitter<string> = new EventEmitter<string>();
    @Output() narrowSearchWithinResults: EventEmitter<any> = new EventEmitter<any>();

    constructor(private _dataStoreService: DataStoreService, private _errorModalService: ErrorModalService) { }

    ngOnInit() {
    }

    preFilters(filters: NavigationEntryModel[]) {


        if (filters.length == 0) return;
        //this.practiceAreas = filters.find(f => f.name == 'practicearea').navigationElements;
        this.topics = filters.find(f => f.name == 'topic').navigationElements;
        this.subTopics = filters.find(f => f.name == 'subtopic').navigationElements;
        this.documentTypes = filters.find(f => f.name == 'lndocumenttypes').navigationElements;

        //this.subTopics = this._dataStoreService.getSessionStorageItem("topicPrefilters");
        if (this.selectedsubTopics && this.subTopics) {
            this.selectedsubTopics.forEach(ssT => {
                if (this.subTopics.find(pa => ssT.displayName == pa.displayName)) {
                    this.subTopics.find(pa => ssT.displayName == pa.displayName).isSelected = true;
                }
            });
        }

        if (this.selectedtopics && this.topics) {
            this.selectedtopics.forEach(ssT => {
                if (this.topics.find(pa => ssT.displayName == pa.displayName)) {
                    this.topics.find(pa => ssT.displayName == pa.displayName).isSelected = true;
                }
            });
        }
        //this.documentTypes = this._dataStoreService.getSessionStorageItem("docPrefilters");
        if (this.selecteddocumentTypes) {
            this.selecteddocumentTypes.forEach(ssT => {
                if (this.documentTypes.find(pa => ssT.displayName == pa.displayName))
                this.documentTypes.find(pa => ssT.displayName == pa.displayName).isSelected = true;
            });
        }

        this.practiceAreas = this._dataStoreService.getSessionStorageItem("practiceAreaPrefilters");
        if (this.practiceAreas && this.selectedpracticeAreas.length > 0) {
            this.selectedpracticeAreas.forEach(spA => {
                if (this.practiceAreas.find(pa => spA.displayName == pa.displayName))
                this.practiceAreas.find(pa => spA.displayName == pa.displayName).isSelected = true;
            });
        } else if (this.searchParams == null) {
            //this.selectedpracticeAreas.forEach(spA => spA.isSelected = false);
            //this.practiceAreas.forEach(spA => spA.isSelected = false);
        }


    }

    selectAllPracticeAreas() {
        this.practiceAreas.forEach(p => p.isSelected = true);
    }

    selectAlltopics() {
        this.topics.forEach(p => p.isSelected = true);
    }

    selectAllsubTopics() {
        this.subTopics.forEach(p => p.isSelected = true);
    }

    selectAlldocumentTypes() {
        this.documentTypes.forEach(p => p.isSelected = true);
    }

    showMorePracticeArea() {
        this.practiceAreaLength = this.practiceAreaLength + 5;
        if (this.practiceAreas.length <= this.practiceAreaLength) {
            this.showLessPracticeAreas = true;
        }
    }

    showMoreTopic() {
        this.topicLength = this.topicLength + 5;
    }

    showMoreSubTopic() {
        this.subTopicLength = this.subTopicLength + 5;
        if (this.subTopics.length <= this.subTopicLength) {
            this.showLessSubTopics = true;
        }
    }

    showMoreDocumentType() {
        this.documentTypeLength = this.documentTypeLength + 5;
        if (this.documentTypes.length <= this.documentTypeLength) {
            this.showLessDocuments = true;
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

        /*
        if (this.selectedpracticeAreas.length > 0)
            practiceAreaFilter = this.selectedpracticeAreas.map(x => x.displayName + ' !' + x.displayName + '[FTS]practicearea').join('~');
        if (this.filters == '')
            this.filters = practiceAreaFilter;
        else if (practiceAreaFilter != '')
            this.filters = this.filters + '[AND]' + practiceAreaFilter;
        
        if (practiceAreaFilter != '') {
            this.selectedPracticeArea.emit(this.filters);
        } else {
            this.reMapSearchFilters();
            this.selectedPracticeArea.emit(this.filters);
        }
        */
    }

    topicClick(checked, topic: NavigationElementModel) {
        var topicFilter = '';

        if (checked)
            this.selectedtopics.push(topic);
        else
            this.selectedtopics.splice(this.selectedtopics.indexOf(topic), 1);

        if (this.selectedtopics.length > 0)
            topicFilter = this.selectedtopics.map(x => x.displayName + ' !' + x.displayName + '[FTS]topic').join('~');
        if (this.filters == '')
            this.filters = topicFilter;
        else
            this.filters = this.filters + '[AND]' + topicFilter;
        this.reMapSearchFilters();
        if (topicFilter != '')
            this.selectedTopic.emit(this.filters);

    }

    subTopicClick(checked, subTopic: NavigationElementModel) {
        var subTopicFilter = '';

        if (checked)
            this.selectedsubTopics.push(subTopic);
        else
            this.selectedsubTopics.splice(this.selectedsubTopics.indexOf(subTopic), 1);

        if (this.selectedsubTopics.length > 0)
            subTopicFilter = this.selectedsubTopics.map(x => x.displayName + ' !' + x.displayName + '[FTS]subtopic').join('~');
        if (this.filters == '')
            this.filters = subTopicFilter;
        else if (subTopicFilter != '')
            this.filters = this.filters + '[AND]' + subTopicFilter;
        this.reMapSearchFilters();
        this.selectedSubTopic.emit(this.filters);
    }

    documentTypeClick(checked, documentType: NavigationElementModel) {
        var documentTypeFilter = '';

        if (checked)
            this.selecteddocumentTypes.push(documentType);
        else
            this.selecteddocumentTypes.splice(this.selecteddocumentTypes.indexOf(documentType), 1);

        if (this.selecteddocumentTypes.length > 0)
            documentTypeFilter = this.selecteddocumentTypes.map(x => x.displayName + ' !' + x.displayName + '[FTS]lndocumenttypes').join('~');
        if (this.filters == '')
            this.filters = documentTypeFilter;
        else if (documentTypeFilter != '')
            this.filters = this.filters + '[AND]' + documentTypeFilter;
        this.reMapSearchFilters();
        this.selectedDocumentType.emit(this.filters);
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


        //  if (this._dataStoreService.getSessionStorageItem('SearchParameter') != null && this.searchParams) {
        //      if (this.searchParams == undefined || this.searchParams == null) {
        //          this.searchParams = new SearchParameters();
        //      }
        //      this.searchParams.Filters = this.filters;
        //      this.searchParams.NarrowSearchTerms = this.narrowSearchTerms;
        //  } else {
        //      if (this.searchParams == undefined || this.searchParams == null) {
        //          this.searchParams = new SearchParameters();
        //      }
        //      this.searchParams.Filters = this._searchedParameters.filters;
        //      this.searchParams.NarrowSearchTerms = this._searchedParameters.narrowSearchTerms;
        //      this.searchParams.OriginalNarrowSearchTerm = this._searchedParameters.originalNarrowSearchTerm;
        //      this.searchParams.PageNumber = this._searchedParameters.pageNumber;
        //      this.searchParams.QueryString = this._searchedParameters.queryString;
        //      this.searchParams.SearchPreFilters = this._searchedParameters.searchPreFilters;
        //      this.searchParams.SearchTerm = this._searchedParameters.searchTerm;
        //      this.searchParams.Size = this._searchedParameters.size;
        //      this.searchParams.Sort = this._searchedParameters.sort;
        //  }

        //this._dataStoreService.setSessionStorageItem('SearchParameter', this.searchParams);
        //this._dataStoreService.setSearchParamter(this.searchParams);
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
        this.selectedDocumentType.emit(this.filters);
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



    }
    practiceAreaClickSearch() {
        this.reMapSearchFilters();
        /*var practiceAreaFilter = '';
        if (this.selectedpracticeAreas.length > 0) {
            practiceAreaFilter = this.selectedpracticeAreas.map(x => x.displayName + ' !' + x.displayName + '[FTS]practicearea').join('~');
            if (this.filters != '')
                this.filters = this.filters + (practiceAreaFilter!=''?('[AND]' + practiceAreaFilter):'');
            else
                this.filters = practiceAreaFilter;

        }*/
        this.selectedPracticeArea.emit(this.filters);
    }

    practiceAreaClickFilter(checked, practicearea: NavigationElementModel) {
        var practiceAreaFilter = ''; 
        if (checked)
            this.selectedpracticeAreas.push(practicearea);
        else
            this.selectedpracticeAreas.splice(this.selectedpracticeAreas.indexOf(practicearea), 1);

        if (this.selectedpracticeAreas.length > 0)
            practiceAreaFilter = this.selectedpracticeAreas.map(x => x.displayName + ' !' + x.displayName + '[FTS]practicearea').join('~');
        if (this.filters == '')
            this.filters = practiceAreaFilter;
        else if (practiceAreaFilter != '')
            this.filters = this.filters + '[AND]' + practiceAreaFilter;

        if (practiceAreaFilter != '') {
            this.selectedPracticeArea.emit(this.filters);
        } else {
            this.reMapSearchFilters();
            this.selectedPracticeArea.emit(this.filters);
        }

    }

    clearWithinSearch() {
        this.narrowSearchTerms = '';
        this.searchText = '';
        this.narrowSearchWithinResults.emit({ "narrowSearchTerms": this.narrowSearchTerms, "originalNarrowText": this.searchText });
    }

    topicsClickSearch() {
        //this.reMapSearchFilters();
        var subTopicFilter = '';
        if (this.selectedsubTopics.length > 0) {
            subTopicFilter = this.selectedsubTopics.map(x => x.displayName + ' !' + x.displayName + '[FTS]subtopic').join('~');
            if (this.filters != '')
                this.filters = this.filters + '[AND]' + subTopicFilter;
            else
                this.filters = subTopicFilter;
        } 
        this.selectedSubTopic.emit(this.filters);
    }

    showLessPracticeArea() {
        this.showLessPracticeAreas = false;
        this.practiceAreaLength = 5;
    }

    showLessSubTopic() {
        this.showLessSubTopics = false;
        this.subTopicLength = 5;
    }

    showLessDocumentType() {
        this.showLessDocuments = false;
        this.documentTypeLength = 5;
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