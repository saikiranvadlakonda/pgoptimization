import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { FoldersService } from '../../../../shared/services/folders/folders.service'
import { CreateFolerViewModel } from '../../../../shared/models/Repository/Create.model';
import { PracticeAreaService } from '../../../../shared/services/practice-areas/practice-areas.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SubscriberFolderEntity, FolderEntity } from '../../../../shared/models/folder';
import { ErrorContent } from '../../../../shared/models/error-content/error-content.model';
import { ErrorModalService } from '../../../../shared/services/error-modal/error-modal.service';
import { PgMessages } from '../../../../shared/constants/messages';

@Component({
    selector: 'browse-folders',
    templateUrl: './browse-folders.component.html',
    styleUrls: ['./browse-folders.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowseFoldersComponent implements OnInit, OnDestroy {

    @Input() public folderInfo: SubscriberFolderEntity[];
    @Input() error: string;
    folderInfolength: number = 3; practiceAreas: any;
    createfolderbtn: any;
    @ViewChild('modalContent') modalContent: TemplateRef<any>
    @Output() showMoreClick = new EventEmitter();
    @Output() reloadFolders = new EventEmitter();
    Createfoldertxt: string;
    CreateFolder: CreateFolerViewModel = new CreateFolerViewModel();
    constructor(
        private _navigationService: NavigationService,
        private _foldersService: FoldersService,
        private _practiceAreaService: PracticeAreaService,
        private modal: NgbModal,
        private modalService: BsModalService,
        private _errorModalService: ErrorModalService
    ) {
    }
    newFolder: boolean = false;
    newClientFolder: any = {
        "folderNameID": null,
        "folderName": "",
        "parentFolderID": null,
        "subscriberClientID": null,
        "clientDescription": "",
        "subscriberID": null,
        "dateCreated": null,
        "lastAccessedDate": null,
        "isVisible": true,
        "isValid": null,
        "isNewFolder": true,
        "isEnableEdit": null,
        "folders": [],
        "files": [],
        "createFolder": ""
    };;

    modalData: {
        event: any;
    };

    modalRef: BsModalRef;

    ngOnInit() {
    }

    showFolderDetails(folder) {
        let input = { isFolderDetails: true, folder: folder };
        this._navigationService.navigate(PgConstants.constants.URLS.Folders.MyFolders, new StateParams(input));
    }

    showMoreFolders() {
        let input = { isFolderDetails: false };
        this._navigationService.navigate(PgConstants.constants.URLS.Folders.MyFolders, new StateParams(input));
    }    

    createFolder(event, template: TemplateRef<any>): void {
        this.Createfoldertxt = "";
        this.modalData = {
            event: {
                title: "Create Folder!!!"
            }
        };
        this.newFolder = true;
    }

    saveCreatFolder () {
        this.newClientFolder.isValid = null;
        if (!this.newClientFolder.clientDescription || this.newClientFolder.clientDescription.trim() == '') {
            this.newClientFolder.isValid = false;
            return;
        }
        if (this.newClientFolder.clientDescription.trim() != "") {
            this.CreateFolder.Createfolder = this.newClientFolder.clientDescription.trim();
            this._foldersService.CreateClient(this.CreateFolder).subscribe((isCreated: any) => {
                if (isCreated) {
                    this.reloadFolders.emit();
                    this.newFolder = false;
                    this.newClientFolder.clientDescription = "";
                    this.newClientFolder.isValid = null;
                } else {
                    let params: ErrorContent = {
                        message: PgMessages.constants.folders.addError,
                        showOk: true,
                        showCancel: false,
                        callBack: undefined
                    }
                    this._errorModalService.open(params);
                }
            });
        }
    }

    onKeyDown(event, folder, val) {
        if (event.keyCode == 13) {
            if (val == 'New') {
                this.saveCreatFolder();
            }            
        }
    }

    cancelCreateClient() {
        this.newFolder = false;
        this.newClientFolder.clientDescription = "";
        this.newClientFolder.isValid = null;
    }
    
    ngOnDestroy() {
        this.newFolder = null;
        this.newClientFolder.clientDescription = "";
    }

}
