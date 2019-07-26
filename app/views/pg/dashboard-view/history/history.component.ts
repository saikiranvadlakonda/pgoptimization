import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HistoryItem } from '../../../../shared/models/history/history-item.model';
//import { distinct } from 'rxjs/operators'
import { HistoryService } from '../../../../shared/services/history/history.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
//import { PgConstants } from '../../../../shared/constants/pg.constants';
//import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { ContentService } from '../../../../shared/services/content/content.service';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';

@Component({
    selector: 'dashboard-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.css'],
    providers: [ContentService]
})
export class HistoryComponent {
    @Input() historyItems: HistoryItem[];
    @Input() timePeriods: string[] = [];
    @Input() error: string;
    @Output() showHistory: EventEmitter<string> = new EventEmitter<string>();


    constructor(private _hisotryService: HistoryService,
        private _navigationService: NavigationService,
        private _contentService: ContentService,
        private _dataStoreService: DataStoreService
    ) {
    }

    showHistoryList() {
        this.showHistory.emit("true");
    }

    navigateToHistory(history) {
        this._contentService.navigateToContent(history);
    }

    getPracticeAreaName(history: HistoryItem) {
        let practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
        let practiceArea = practiceAreas.find(pa => history.domainPath.includes(pa.domainPath));
        if (practiceArea != undefined) {
            return practiceArea.title;
        } else {
            return history.lmtTitlePath.split("|")[2];
        }
    }
}
