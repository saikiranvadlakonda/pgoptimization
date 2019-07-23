import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { WhatsNewService } from '../../../../shared/services/whats-new/whats-new.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { PgModalService } from '../../../../shared/services/pg-modal/pg-modal.service';

@Component({
    selector: 'app-whatsnew-carousel',
    templateUrl: './whatsnew-carousel.component.html',
    styleUrls: ['./whatsnew-carousel.component.scss']
})
export class WhatsnewCarouselComponent implements OnInit {
    _newItems: any;
    carouselNum: number = 1;
    totalSlides: number = 3;
    itemsPerSlide: number = 4;

    @Input() whatsNewError: any;
    @Input() newItemsLoaded: any;
    @Output() showMoreWhatsNew: EventEmitter<any> = new EventEmitter<any>();
    @Input('newItems') set newItems(newItems: any) {
        this._newItems = newItems;
        if (newItems) {
            let totalSlides = Math.ceil(newItems.length / 4);
            this.totalSlides = (totalSlides > this.totalSlides) ? this.totalSlides : totalSlides;
        }
    };
    get newItems(): any {
        return this._newItems;
    };

    constructor(
        private _dataStoreService: DataStoreService,
        private _navigationService: NavigationService,
        private _whatsNewService: WhatsNewService,
        private _modalService: PgModalService
    ) { }

    ngOnInit() {
    }

    detailView(newItem) {
        newItem.disablePermalink = true;
        this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("AllPracticeAreas").find(d => newItem.domainPath.includes(d.domainPath));
        if (selectedPracticeArea && selectedPracticeArea.isSubscribed) {
            newItem.isValid = true;
            this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
            this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
            this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
        } else {
            newItem.isValid = false;
            this._whatsNewService.findSubscribedNews(newItem).subscribe(isAllowedNews => {
                if (isAllowedNews) {
                    this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
                    this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
                    this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
                } else {
                    this._modalService.open();
                }
            });
        }
    }

    openWhatsNewPdf(newItem) {
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("AllPracticeAreas").find(nI => newItem.domainPath.includes(nI.domainPath));
        if (selectedPracticeArea.isSubscribed) {
            window.open(newItem.link, "_blank");
        } else {
            this._whatsNewService.findSubscribedNews(newItem).subscribe(isAllowedNews => {
                if (isAllowedNews) {
                    window.open(newItem.link, "_blank");
                } else {
                    this._modalService.open();
                }
            });
        }
    }

    updateSlideIndex(event: number): void {
        this.carouselNum = event + 1;
    }

    showMore(): void {
        this.showMoreWhatsNew.emit();
    }

    getArray(length: number): any {
        return new Array(length);
    }
}
