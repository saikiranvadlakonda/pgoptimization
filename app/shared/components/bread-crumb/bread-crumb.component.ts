import { Component, OnInit, Input } from '@angular/core';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DataStoreService } from '../../services/data-store/data-store.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/empty';
import { PgConstants } from '../../constants/pg.constants';
import { StateParams } from '../../models/state-params/state-params.model';

@Component({
    selector: 'app-bread-crumb',
    templateUrl: './bread-crumb.component.html',
    styleUrls: ['./bread-crumb.component.scss']
})
export class BreadCrumbComponent implements OnInit {
    constructor(private _navigationService: NavigationService,
        private _dataStoreService: DataStoreService, private router: Router, private activatedRoute: ActivatedRoute) { }


    @Input() practiceArea: string;
    @Input() subTopic: string;
    @Input() guidanceHeader: string;
    @Input() title: string;
    ngOnInit() {
    }

    breadCrumbNavigation(title, page) {
        let practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
        let selectedPracticeArea = practiceAreas.find(p => p.title == this.practiceArea);
        let selectedTopic;
        let selectedSubTopic;

        selectedPracticeArea.subTocItem.forEach(topic => {
            if (topic.subTocItem) {
                topic.subTocItem.forEach(subTopic => {
                    if (subTopic.title == this.subTopic) {
                        selectedTopic = topic;
                        selectedSubTopic = subTopic;
                    }

                });
            }
        });
        

        
        switch (page) {
            case 'subTopic':
                this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
                this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(selectedPracticeArea));
                break;
            case 'guidanceNote':
                this._dataStoreService.setSessionStorageItem("SelectedSubTopic", selectedSubTopic);
                var input = { "subTopicDomainPath": selectedSubTopic.domainPath, "title": this.practiceArea + " > " + selectedSubTopic.title, "practiceArea": selectedSubTopic.title, rootArea: this.practiceArea, "subTopic": selectedSubTopic };
                this._dataStoreService.setSessionStorageItem("guidanceNote", input);
                this._navigationService.isNavigationSubTopic = true;
                this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
                break;
            case '': break;
            default: break;
        }
        
    }
}
