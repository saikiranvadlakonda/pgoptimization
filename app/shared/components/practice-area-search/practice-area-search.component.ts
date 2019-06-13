import { Component, OnInit, ViewChild, ElementRef, TemplateRef, Output, EventEmitter, Input } from '@angular/core';
import { SearchParameters } from '../../models/search';
import { SearchPracticeAreas } from '../../models/search/searchPracticeAreas.model';
import { NavigationService } from '../../services/navigation/navigation.service';
import { PgConstants } from '../../constants/pg.constants';
import { StateParams } from '../../models/state-params/state-params.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PracticeAreaService } from '../../services/practice-areas/practice-areas.service';
import { DataStoreService } from '../../services/data-store/data-store.service';
import { TocItemViewModel } from '../../models/practiceAreas/tocItem.model';
import { SearchService } from '../../services/search/search-service';


@Component({
    selector: 'practice-area-search',
    templateUrl: './practice-area-search.component.html',
    styleUrls: ['./practice-area-search.component.css']
})
export class PracticeAreaSearchComponent implements OnInit {


    searchParamters: SearchParameters = new SearchParameters();

    searchTerm: string = '';
    practiceAreas: any[] = [];
    searchPracticeAreas: any[] = [];
    selectedPracticeAreas: any[] = [];
    SearchPreFilters: string = '';
    status: { isopen: boolean } = { isopen: false };
    @ViewChild('modalContent') modalContent: TemplateRef<any>;
    @ViewChild('modalContentAlert') modalContentAlert: TemplateRef<any>;
    @ViewChild('searchInput') searchInput: ElementRef;
    @Output() onCloseMobiSearchModal: EventEmitter<any> = new EventEmitter<any>();
    @Input() focusOn: boolean;
    modalRef: BsModalRef;
    modalAlertRef: BsModalRef;
    toggleDropdown($event: MouseEvent): void {
        $event.preventDefault();
        $event.stopPropagation();
        this.status.isopen = !this.status.isopen;
    }

    change(value: boolean): void {
        this.status.isopen = value;
    }

    constructor(
        private _navigationService: NavigationService,
        private modal: NgbModal,
        private modalService: BsModalService,
        private _practiceAreaService: PracticeAreaService,
        private _dataStoreService: DataStoreService,
        private _searchService: SearchService
    ) {
    }

    ngOnInit() {
        //this.searchTerm = this.searchInput.nativeElement.value;
    }

    public ngAfterViewInit(): void {
        if (this.focusOn) {
            this.searchInput.nativeElement.focus();
        }
    }

    setPracticeAreas() {
        let searchPAs = this._dataStoreService.getSessionStorageItem("searchFilters");

        this.searchPracticeAreas = this.practiceAreas.map(practicearea => {
                return {
                    title: practicearea.key,
                    isSelected: true,
                    issubscribed: true
                }
            });
        this.searchPracticeAreas.forEach(pa => this.selectedPracticeAreas.push(pa));
    }
    setParameter() {
        //document.getElementById("searchTextInput").focus();

        if (this.practiceAreas.length == 0) {
            this.populatePracticeAreas();
        }
        if (this.searchTerm != "" && this.searchTerm.length >= 3) {
            this.onCloseMobiSearchModal.emit();
            this.searchParamters = new SearchParameters();
            //var selectedCount = this.searchPracticeAreas.filter(p => p.isSelected == true).length;
            var selectedCount = this.selectedPracticeAreas.length;
            this.searchTerm = this.searchInput.nativeElement.value;
            if (this.searchTerm == '' || selectedCount == 0) {
                if (this.searchTerm == '')
                    this.modalAlertRef = this.modalService.show(this.modalContentAlert, { backdrop: 'static', keyboard: false });
                else {
                    if (selectedCount == 0)
                        this.modalAlertRef = this.modalService.show(this.modalContentAlert, { backdrop: 'static', keyboard: false });
                }

            }
            else {
                let filters = '';
                if (this.selectedPracticeAreas.length > 0) {
                    this.SearchPreFilters = 'practicearea[FTS]' + this.selectedPracticeAreas.map(x => x.title).join('|');
                }
                this.searchParamters.SearchTerm = this.searchTerm;
                this.searchParamters.SearchPreFilters = this.SearchPreFilters;

                if (this.modalRef != undefined && this.modalRef != null)
                    this.modalRef.hide();
                this._navigationService.navigate(PgConstants.constants.URLS.Header2.SearchResults, new StateParams(this.searchParamters));
            }
        } else {
            //modalContentAlert
            this.modalAlertRef = this.modalService.show(this.modalContentAlert, { backdrop: 'static', keyboard: false });
            document.getElementById("searchTextInput").focus();

        }
    }

    practiceAreaClick(checked, practicearea: SearchPracticeAreas) {
        if (practicearea.type == "PA-MD") {
            //.map(x => x.displayName + ' !' + x.displayName + '[FTS]topic').join('~')


        }
        if (checked)
            this.selectedPracticeAreas.push(practicearea);
        else
            this.selectedPracticeAreas.splice(this.selectedPracticeAreas.indexOf(practicearea), 1);

        if (this.selectedPracticeAreas.length > 0)
            this.SearchPreFilters = 'practicearea[FTS]' + this.selectedPracticeAreas.map(x => x.key).join('|');
    }

    selectAllPracticeArea() {
        this.searchPracticeAreas.forEach(p => p.isSelected = true);
        this.selectedPracticeAreas = [];
        this.searchPracticeAreas.map(pa => this.selectedPracticeAreas.push(pa));
        this.SearchPreFilters = '';
    }

    deSelectAllPracticeArea() {
        this.searchPracticeAreas.forEach(p => p.isSelected = false);
        this.selectedPracticeAreas = [];
        this.SearchPreFilters = '';
    }

    openModal(template: TemplateRef<any>) {
        if (this.practiceAreas.length == 0) {
            this.populatePracticeAreas();
            this.modalRef = this.modalService.show(template, { class: 'search-modal' });
        } else {
            this.modalRef = this.modalService.show(template, { class: 'search-modal' });
        }
        
    }

    populatePracticeAreas() {

        if (this._dataStoreService.getSessionStorageItem("searchFilters") != null) {
            this.practiceAreas = this._dataStoreService.getSessionStorageItem("searchFilters");
            this.setPracticeAreas();
        } else {
            this._searchService.getSearchFilters().subscribe(data => {
                this.practiceAreas = data;
                this._dataStoreService.setSessionStorageItem("searchFilters", this.practiceAreas);
                this.setPracticeAreas();
            });
        }
    }
    forceSearch(event: KeyboardEvent) {
        if (event.keyCode == 13) {
            this.setParameter();
        }
    }
    clearText() {
        this.searchTerm = '';
        this.searchInput.nativeElement.focus();

    }
    closeModal(template: TemplateRef<any>) {
        if (this.modalAlertRef != undefined && this.modalAlertRef != null)
            this.modalAlertRef.hide();
    }

    openHelpModal(template): void {
        this.modalAlertRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
    }

    applyNSearch() {

        this.selectedPracticeAreas = this.searchPracticeAreas.filter(p => p.isSelected == true);
        //if (this.selectedPracticeAreas.length > 0) {
        //    this.status.isopen = !this.status.isopen;
        //}

        var selectedCount = this.selectedPracticeAreas.length;

        if (this.searchTerm == '' || selectedCount == 0) {
            if (this.searchTerm == '')
                //alert("Enter search Term");
                //this.openModal(this.modalContentAlert);
                this.modalAlertRef = this.modalService.show(this.modalContentAlert, { backdrop: 'static', keyboard: false });
            else {
                if (selectedCount == 0)
                    //alert("Select atleast one practice area");
                    //this.openModal(this.modalContentAlert);
                    this.modalAlertRef = this.modalService.show(this.modalContentAlert, { backdrop: 'static', keyboard: false });
            }

        } else {
            this.setParameter();
        }

    }

    closeAllModals() {
        if (this.modalAlertRef != undefined && this.modalAlertRef != null)
            this.modalAlertRef.hide();
        if (this.modalRef != undefined && this.modalRef != null)
            this.modalRef.hide();
        if (this.searchTerm.trim().length == 0) {
            this.searchInput.nativeElement.focus();
        }
    }
}