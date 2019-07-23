import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SearchResultModel, SearchParameters, searchedParameters } from '../../../../shared/models/search';


@Component({
    selector: 'search-result',
    templateUrl: './result.component.html',
    styleUrls: ['./result.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultComponent implements OnInit {

    @Input() pagedItems: SearchResultModel[];
    @Input() pager: any = {};
    @Input() pageSize: number;
    @Input() sort: boolean;
    @Input() error: string;

    searchParamter: SearchParameters;
    isAllChecked: boolean = false;
    _searchedParameters: searchedParameters;
    wc: number = 300;
    @Input()
    set searchedParameters(_searchedParameters: searchedParameters) {
        this.pageSize = _searchedParameters.size;
        this.sort = _searchedParameters.sort;
    }

    @Output() selectedPagesize: EventEmitter<number> = new EventEmitter<number>();
    @Output() selectedSort: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() selectedPageNumber: EventEmitter<number> = new EventEmitter<number>();
    @Output() selectedDomainPath: EventEmitter<any> = new EventEmitter<any>();
    @Output() checkedResult: EventEmitter<any> = new EventEmitter<any>();


    selectedResult: SearchResultModel[];

    constructor() { }

    ngOnInit() {
        if (this.pagedItems && this.pagedItems.length > 0) {
            this.pagedItems.forEach(pI => {
                pI.isChecked = false;
            });
        }
    }

    onPageSizeChange(size) {
        this.pageSize = size;
        this.selectedPagesize.emit(size);
    }

    onSortChange(value) {
        this.selectedSort.emit(value);
    }

    setPage(pageNumber: number) {
        if ((this.pager.currentPage == 1 && pageNumber == 0) || (this.pager.currentPage == this.pager.totalPages && pageNumber == this.pager.totalPages)) {
            return;
        }
        this.selectedPageNumber.emit(pageNumber);
    }

    onTitleClick(result: SearchResultModel, i: number) {
        const pagerank = (this.pager.pageSize * (this.pager.currentPage - 1)) + (i + 1);
        this.selectedDomainPath.emit({result, pagerank});
    }

    searchResultChecked(isChecked, result) {
        if (!this.selectedResult)
            this.selectedResult = [];
        if (isChecked) {
            result.isChecked = true;
            this.selectedResult.push(result);
        }
        else {
            result.isChecked = false;
            this.selectedResult.splice(this.selectedResult.findIndex(s => s == result), 1);
        }
        this.isAllChecked = (this.pagedItems.length == this.selectedResult.length ? true : false);
        this.checkedResult.emit(this.selectedResult);

    }

    selectAllResults(isChecked) {
        this.selectedResult = [];
        if (isChecked) {
            this.pagedItems.forEach(p => {
                p.isChecked = true;
                this.selectedResult.push(p);
            });
        }
        else {
            this.pagedItems.forEach(p => {
                p.isChecked = false;
            });
        }
        this.isAllChecked = (this.pagedItems.length == this.selectedResult.length ? true : false);
        this.checkedResult.emit(this.selectedResult);
    }

    selectAllResultsFromLabel() {
        this.selectedResult = [];
        if (!this.isAllChecked) {
            this.pagedItems.forEach(p => {
                p.isChecked = true;
                this.selectedResult.push(p);
            });
        }
        else {
            this.pagedItems.forEach(p => {
                p.isChecked = false;
            });
        }
        this.isAllChecked = (this.pagedItems.length == this.selectedResult.length ? true : false);
        this.checkedResult.emit(this.selectedResult);
    }

    setReadMoreContentLines() {
        var ele = window.document.getElementById('resCntDecrp').offsetWidth;
        this.wc = ele + 70;
        return ele + 70;
    }
}
