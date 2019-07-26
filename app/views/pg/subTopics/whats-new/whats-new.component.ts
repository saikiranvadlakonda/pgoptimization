import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { PgModalService } from '../../../../shared/services/pg-modal/pg-modal.service';
import { WhatsNewService } from '../../../../shared/services/whats-new/whats-new.service';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { PgMessages } from '../../../../shared/constants/messages';

@Component({
    selector: 'whats-new',
    templateUrl: './whats-new.component.html',
    styleUrls: ['./whats-new.component.css']
})
export class WhatsNewComponent implements OnInit {

    @Input() breakingNews;
    @Input() recentCases;
    @Input() news;
    @Input() error: string;
    @Output() newsItem: EventEmitter<any> = new EventEmitter<any>();
    @Input() whatsNewInput;

    constructor(private _dataStoreService: DataStoreService, private _modalService: PgModalService, private _navigationService: NavigationService, private _whatsNewService: WhatsNewService) { }

    ngOnInit() {
        if (this.news) {
            let data = this.news;
            let newsList = [];
            data.forEach(newsGroup => {
                if (newsGroup) {
                    newsList.push(newsGroup);
                }
            });

            newsList.sort((nItem1, nItem2) => {
                return new Date(nItem2.datePublished).getTime() - new Date(nItem1.datePublished).getTime();
            });
            this.news = newsList;
            this.error = (this.news.length == 0) ? PgMessages.constants.whatsNew.noWhatsNewForSelectedPA : undefined;
        } else {
            this.news = [];
            this.error = PgMessages.constants.whatsNew.error;
        }
    }

    detailView(newItem) {
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");
        newItem.disablePermalink = true;
        if (selectedPracticeArea.isSubscribed) {
            if (newItem.isPdf == 'True') {
                this.openWhatsNewPdf(newItem);
            } else {
                newItem.isValid = true;
                this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
                this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
                this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
            }
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

    showAllWhatsNew() {
        var practiceAreaTitle = this.news[0].practiceAreaTitle;
        var inputNotedet = { "paTitle": practiceAreaTitle };
        this._dataStoreService.setSessionStorageItem("WhatsNews", this.news);
        this._navigationService.navigate(PgConstants.constants.URLS.WhatsNew.WhatsNew, new StateParams(inputNotedet));
    }

    openWhatsNewPdf(newItem) {
        window.open(newItem.link, "_blank");
    }
}
