import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TocItemViewModel } from '../../../shared/models/practiceAreas';
import { NavigationService } from '../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../shared/constants/pg.constants';
import { DataStoreService } from '../../../shared/services/data-store/data-store.service';
import { PgModalService } from '../../../shared/services/pg-modal/pg-modal.service';
@Component({
    selector: 'essentials',
    templateUrl: './essentials.component.html',
    styleUrls: ['./essentials.component.css']
})
export class EssentialsComponent implements OnInit {
    @Input() essentials;
    @Output() essential: EventEmitter<any> = new EventEmitter<any>();
    @Input() subTopics: TocItemViewModel[];
    pgConstants = PgConstants.constants;
    length: number = 5;

    constructor(
        private _navigationService: NavigationService,
        private _dataStoreService: DataStoreService,
        private _modalService: PgModalService) { }

    ngOnInit() {
    }

    getEssentials(essentialsList, eType, guidance) {
        if (this.essentials == null)
            this.essentials = [];
        if (essentialsList == null)
            return;
        essentialsList.forEach(e => {
            e.subContentDomains.forEach(el => {
                el.eType = eType;
                el.guidance = guidance;
                this.essentials.push(el);
            });
        })
       
    }

    onClick(essential) {
        this.essential.emit(essential);
    }

    viewAllEssentials() {
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        if (selectedPracticeArea.isSubscribed)
            this._navigationService.navigate(PgConstants.constants.URLS.Essential.Essential);
        else
            this._modalService.open();

    }
}

