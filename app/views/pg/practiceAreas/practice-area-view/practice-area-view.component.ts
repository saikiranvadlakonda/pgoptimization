import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { TocItemViewModel } from '../../../../shared/models/practiceAreas/tocItem.model'
import { SubTocItemViewModel } from '../../../../shared/models/practiceAreas/subTocItem.model';
import { FilterPipe } from '../../../../shared/pipes/filter/filter.pipe';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';

@Component({
    selector: 'practice-area-view',
    templateUrl: './practice-area-view.component.html',
    styleUrls: ['./practice-area-view.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush

})
export class PracticeAreaViewComponent implements OnInit {

    @Input() practiceAreas: TocItemViewModel[];
    @Input() searchText: string = '';
    @Output() getSubTopic: EventEmitter<SubTocItemViewModel[]> = new EventEmitter<SubTocItemViewModel[]>();
    @Output() getSelectedPracticeAreaTitle: EventEmitter<string> = new EventEmitter<string>();
    @Input() selectedPracticeArea: TocItemViewModel;

    @Output() tabClicked: EventEmitter<string> = new EventEmitter();

    constructor(private _dataStoreService: DataStoreService) { }

    ngOnInit() {
        var practicearea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        var subTopic = this._dataStoreService.getSessionStorageItem("SelectedSubTopic");
        if (practicearea && subTopic) {
            this.onPracticeAreaSelect(practicearea.subTocItem, practicearea);
        }
        else {
            practicearea = this.practiceAreas.find(pA => pA.isSubscribed == true);
            this.onPracticeAreaSelect(practicearea.subTocItem, practicearea);
        }

    }

    onPracticeAreaSelect(subtopic, practicearea) {
        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", practicearea);
        this._dataStoreService.setSessionStorageItem("SelectedSubTopic", subtopic);
        this.selectedPracticeArea = practicearea;
        this.tabClicked.emit(practicearea.title);
        this.getSubTopic.emit(subtopic);
        this.getSelectedPracticeAreaTitle.emit(practicearea);
    }



}
