import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { RouterModule, RouterLink } from '@angular/router';
import { NavigationService } from '../../services/navigation/navigation.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { DataStoreService } from '../../services/data-store/data-store.service';
import { PgConstants } from '../../constants/pg.constants';
import { NewGroupEntity, NewItemEntity } from '../../../shared/models/whats-new/new-group.model';
import { TocItemViewModel } from '../../models/practiceAreas';
import { WhatsNewService } from '../../services/whats-new/whats-new.service';
import { StateParams } from '../../../shared/models/state-params/state-params.model';
import { PracticeAreaService } from '../../services/practice-areas/practice-areas.service';
import { PgMessages } from '../../../shared/constants/messages';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
    selector: 'app-header2',
    templateUrl: './app-header2.component.html',
    styleUrls: ['./app-header2.component.scss']
})
export class AppHeader2Component implements OnInit {
    isCollapsed: boolean = true;
    isPaDropdownCollapsed: boolean = true;
    modalRef: BsModalRef;
    newItems: NewItemEntity[];
    firstSubscribedPA: string;
    subscribedPracticeArea: TocItemViewModel;
    newItemsLoaded: boolean = false;
    @ViewChild('modalContent') modalContent: TemplateRef<any>;
    practiceAreas: TocItemViewModel[];
    practiceAreaError: string;
    showPracticeAreas: boolean = false;
    subTopics: TocItemViewModel[] = [];
    isShowSubTopics: boolean = false;
    selectedPracticeArea: TocItemViewModel;
    activeIds: string[] = [];

    constructor(private modal: NgbModal, private modalService: BsModalService, private _navigationService: NavigationService,
        private _dataStoreService: DataStoreService, private _whatsNewService: WhatsNewService, private _practiceAreaService: PracticeAreaService, private _authService: AuthService ) { }

    ngOnInit() {
        let curObj = this;
        window.onclick = function (event: any) {
            if (event && event.target && event.target.classList && !event.target.classList.contains('practiceAreasSubDiv') && event.target.parentElement && !event.target.parentElement.classList.contains('practiceAreasSubDiv') && !event.target.parentElement.classList.contains('pa-hamburger-link-text'))
                curObj.isPaDropdownCollapsed = true;
        }
    }

    openMobiSearch(template: TemplateRef<any>) {

        //this.modalRef = this.modalService.show(template);
        this.modalRef = this.modalService.show(template, { class: 'mobi-search-modal' });
    }

    closeMobieSearchModal() {
        this.modalRef.hide();
    }

    navigateToCalendar() {
        this.closeMenu();
        this._dataStoreService.setSessionStorageItem("viewDate", null);
        this._navigationService.navigate(PgConstants.constants.URLS.Calendar.Calendar);
    }

    navigateToFolders() {
        this.closeMenu();
        let input = { isFolderDetails: false };
        this._navigationService.navigate(PgConstants.constants.URLS.Folders.MyFolders, new StateParams(input));
    }

    getAllWhatsNews() {
        this.closeMenu();
        if (window.location.href.indexOf('whats-new') != -1) return;
        this.firstSubscribedPA = "Test";//this.subscribedPracticeArea.title;

        let input = {
            "domainPath": "a2ioc", "tocItemType": "PA", "pageIndex": 0, "pageSize": 10
        };
        this._whatsNewService.getAllLatestWhatsNew(input).subscribe(data => {
            this.newItems = [];
            this.newItems = data;
            this._dataStoreService.setSessionStorageItem("WhatsNews", data);
            this.newItemsLoaded = true;

            var inputNotedet = {};
            this._navigationService.navigate(PgConstants.constants.URLS.WhatsNew.WhatsNew, new StateParams(inputNotedet));
        });
    }

    getPracticeAreas() {
        if (this._dataStoreService.getSessionStorageItem("AllPracticeAreas") != null) {
            this.setModulesAsPracticeAreas(this._dataStoreService.getSessionStorageItem("AllPracticeAreas"));
            this.practiceAreaError = (this.practiceAreas.length == 0) ? PgMessages.constants.practiceArea.noPracticeAreas : undefined;
        } else {
            this._practiceAreaService.getPracticeAreas().subscribe((practiceAreas: any) => {
                if (practiceAreas && practiceAreas.length > 0) {
                    if (practiceAreas[0].isValid) {
                        this._dataStoreService.setSessionStorageItem("AllPracticeAreas", practiceAreas);
                        this.setModulesAsPracticeAreas(practiceAreas);
                        this.practiceAreaError = undefined;
                    } else {
                        this.practiceAreas = [];
                        this.practiceAreaError = PgMessages.constants.practiceArea.error;
                    }
                } else {
                    this.practiceAreas = [];
                    if ((Array.isArray(practiceAreas))) {
                        this.practiceAreaError = PgMessages.constants.practiceArea.noPracticeAreas;
                        alert("You are not subscribed to Practical Guidance. Do you wish to view more information about this product?");
                    } else {
                        this.practiceAreaError = PgMessages.constants.practiceArea.error;
                    }
                }
            });
        }
    }

    setModulesAsPracticeAreas(practiceAreas: TocItemViewModel[]): void {
        this.practiceAreas = [];
        practiceAreas.forEach((practiceArea: TocItemViewModel) => {
            if (practiceArea.type === 'MD') {
                let modules: TocItemViewModel[] = practiceArea.subTocItem.map((individualModule: TocItemViewModel) => {
                    individualModule.isSubscribed = practiceArea.isSubscribed;
                    if (practiceArea.title.includes('Income Tax'))
                        individualModule.title = 'Tax' + ' - ' + individualModule.title;
                    else if (practiceArea.title.includes('Real Estate'))
                        individualModule.title = 'Real Estate' + ' - ' + individualModule.title;
                    else
                        individualModule.title = practiceArea.title + ' - ' + individualModule.title;
                    return individualModule;
                });
                this.practiceAreas.push(...modules);
            } else {
                this.practiceAreas.push(practiceArea);
            }
        });
    }

    setSelectedSubTopic(subTopic) {
        this._dataStoreService.setSessionStorageItem("SelectedSubTopic", subTopic);
    }

    openPracticeAreasMenu(): void {

        this.getPracticeAreas();
        this.showPracticeAreas = true;
    }

    navigateToGuidanceNote(subtopic: TocItemViewModel) {
        this.closeMenu();
        this.setSelectedSubTopic(subtopic);
        var input = { "subTopicDomainPath": subtopic.domainPath, "title": this.selectedPracticeArea.title + " > " + subtopic.title, "practiceArea": subtopic.title, rootArea: this.selectedPracticeArea.title, "subTopic": subtopic };
        this._navigationService.isNavigationSubTopic = true;
        this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
    }

    showSubTopics(selectedPracticeArea: TocItemViewModel): void {
        this.isShowSubTopics = true;
        this.activeIds = [];
        this.subTopics = [];
        this.selectedPracticeArea = selectedPracticeArea;
        selectedPracticeArea.subTocItem.forEach(topic => {
            if (topic.title.toLowerCase() != "introduction")
                this.subTopics = [...this.subTopics, topic];
        });
    }

    navigateToSubtopics(): void {
        this.closeMenu();
        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", this.selectedPracticeArea);
        this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(this.selectedPracticeArea));
        
    }

    navigateToSubTopicPage(practiceArea: TocItemViewModel): void {
        this.closeMenu();
        this.isPaDropdownCollapsed = true;
        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", practiceArea);
        this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(practiceArea));
    }

    openMobiMenu(): void {
        this.isCollapsed = false;
        document.querySelector("body").classList.add("disable-scroll");
    }

    closeMenu(): void {
        this.isCollapsed = true;
        this.showPracticeAreas = false;
        this.isShowSubTopics = false;
        document.querySelector("body").classList.remove("disable-scroll");
    }

    openPADropdown(): void {
        this.getPracticeAreas();
        this.isPaDropdownCollapsed = !this.isPaDropdownCollapsed;
    }

    openModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
    }

    addOrRemoveActivePanel(id: number): void {
        let index: number = this.activeIds.indexOf('mainpanel-' + id);
        if (index > -1) {
            this.activeIds.splice(index, 1);
        } else {
            this.activeIds.push('mainpanel-' + id);
        }
    }

    logout(): void {
        this.closeMenu();
        this._authService.logout();
    }

    redirectToLibrary() {
        this.closeMenu();
        this._authService.redirectedToLibrary().subscribe((redirectUrl) => {
            if (redirectUrl) {
                if (redirectUrl.redirectUrl) {
                    window.location.href = redirectUrl.redirectUrl.m_StringValue;
                }
            }
        });
    }

    loadClassicView() {
        window.parent.postMessage("loadClassicPG", "*");
    }
}
