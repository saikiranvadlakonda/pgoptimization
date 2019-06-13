import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { PracticeAreaService } from '../../../../shared/services/practice-areas/practice-areas.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { TocItemViewModel, SubTocItemViewModel } from '../../../../shared/models/practiceAreas';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { PagerService } from '../../../../shared/services/pager/pager.service';

@Component({
    selector: 'practice-areas',
    templateUrl: './practice-areas.component.html',
    styleUrls: ['./practice-areas.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PracticeAreasComponent implements OnInit {

    subTopic: SubTocItemViewModel[];
    selectedPracticeArea: TocItemViewModel;
    practiceAreas: Observable<TocItemViewModel[]>;
    searchText: string = '';
    subTopicsList: SubTocItemViewModel[] = [];
    private subscriptions: Subscription = new Subscription();

    constructor(private practiceAreaService: PracticeAreaService,
        private routerProxy: RouterProxy,
        private _navigationService: NavigationService,
        private _dataStoreService: DataStoreService,
        private _pageService: PagerService) { }

    ngOnInit() {
        this._pageService.setPageView();
        //window.scrollTo(0, 0);
        /*
        let scrollEle = document.getElementById('newpg');
        if (window.navigator.userAgent.indexOf("Edge") == -1)
            scrollEle.scrollTo(0, 0);
        else
            scrollEle.scrollTop = 0;
        */
        this.practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
    }
    

    setSubTopic(subtopic) {
        //this.subTopic = subtopic;
        this.subTopicsList = [];
        if (subtopic != null && subtopic != undefined && subtopic.forEach != undefined) {
            subtopic.forEach(st => {
                this.setSubTopics(st);
            });
        }
        this.subTopic = this.subTopicsList;
    }

    setPracticeAreaTitle(practicearea) {
        this.selectedPracticeArea = practicearea;
    }

    navigateToGuidanceNote(subtopic: SubTocItemViewModel) {

        var input = {
            "subTopicDomainPath": subtopic.domainPath, "title": this.selectedPracticeArea.title + " > " + subtopic.title, "rootArea": this.selectedPracticeArea.title, "practiceArea": subtopic.title, "subTopic": subtopic};
        this._navigationService.isNavigationSubTopic = false;
        this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
    }
    clearFilter() {
        this.searchText = "";
    }


  navigateToSubTopics(event) {
    this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(this.selectedPracticeArea));
      
  }

    setSubTopics(topic: SubTocItemViewModel) {
        if (topic.hasChildren && topic.subTocItem != null && topic.subTocItem.length > 0) {
            return topic.subTocItem.map(subTopic => {
                return this.setSubTopics(subTopic);
            });
        } else if (topic.type == "ST") {
            this.subTopicsList.push(topic);
            return topic;
        } else {
        }
    }
}
