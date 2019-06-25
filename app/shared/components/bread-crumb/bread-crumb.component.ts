import { Component, OnInit, Input } from '@angular/core';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DataStoreService } from '../../services/data-store/data-store.service';

@Component({
    selector: 'app-bread-crumb',
    templateUrl: './bread-crumb.component.html',
    styleUrls: ['./bread-crumb.component.scss']
})
export class BreadCrumbComponent implements OnInit {
    constructor(private _navigationService: NavigationService,
        private _dataStoreService: DataStoreService) { }


    @Input() rootArea: any;
    @Input() subTopicTitle: any;


    ngOnInit() {
    }

    breadCrumbNavigation(rootArea) {
        console.log("root area" + rootArea);
    }
}
