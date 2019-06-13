import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { TocItemViewModel } from '../../../../shared/models/practiceAreas';
import { FilterByPropertyPipe } from '../../../../shared/pipes/filter-by-property/filter-by-property.pipe';

@Component({
    selector: 'dashboard-practice-area',
    templateUrl: './practice-area.component.html',
    styleUrls: ['./practice-area.component.scss']
})
export class PracticeAreaComponent implements OnInit {
    @Input() practiceAreas: TocItemViewModel[];
    @Input() error: string;
    screenWidth: number;
    countOfPaToShow: number = 9;
    searchQuery: string;
    filteredPracticeAreas: TocItemViewModel[];

    @Output() domainPath: EventEmitter<string> = new EventEmitter<string>();

    constructor(private _filterByPropertyPipe: FilterByPropertyPipe) {
        this.getScreenSize();
    }

    ngOnInit() {
        this.filteredPracticeAreas = this.practiceAreas;
    }

    @HostListener('window:resize', ['$event'])
    getScreenSize(event?) {
        this.screenWidth = window.screen.width;
    }

    setDomainPath(domainPath) {
        this.domainPath.emit(domainPath);
    }

    toggleShowMore(): void {
        if (this.screenWidth > 991) {
            this.countOfPaToShow = this.countOfPaToShow > 9 ? 9 : this.practiceAreas.length;
        } else {
            this.countOfPaToShow = this.countOfPaToShow > 9 ? 9 : this.filteredPracticeAreas.length;
        }
    }

    onSearchQueryEnter(event: any): void {
        //if (event.keyCode == 13)
            this.searchPracticeAreas();
    }

    searchPracticeAreas(): void {
        this.filteredPracticeAreas = this._filterByPropertyPipe.transform(this.practiceAreas, this.searchQuery, 'title');
    }
}
