import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataStoreService } from '../../services/data-store/data-store.service';

@Component({
    selector: 'recently-viewed',
    templateUrl: './recently-viewed.component.html',
    styleUrls: ['./recently-viewed.component.css']
})
export class RecentlyViewedComponent implements OnInit {

    constructor(private _dataStoreService: DataStoreService) { }

    @Input() recentlyViewed;
    @Output() selectedRecentlyViewed: EventEmitter<any> = new EventEmitter<any>();
    @Output() viewAllClick: EventEmitter<any> = new EventEmitter<any>();


    ngOnInit() {
    }

    onRecentlyViewedClick(recentlyviewed) {
        this.selectedRecentlyViewed.emit(recentlyviewed);
    }

    viewAll() {
        this.viewAllClick.emit(true);
    }


    getPracticeAreaName(history: any) {
        let practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
        let practiceArea = practiceAreas.find(pa => (history && history.domainPath && history.domainPath.includes(pa.domainPath)));
        if (practiceArea != undefined) {
            return practiceArea.title;
        } else if (history.lmtTitlePath) {
            return history.lmtTitlePath.split("|")[2];
        } else {
            return "";
        }
    }
}
