import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, TemplateRef, OnDestroy } from '@angular/core';
import { FolderInfoViewModel } from '../../../../shared/models/Repository/folderInfo.model';
import { Observable } from 'rxjs/Observable';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { FoldersService } from '../../../../shared/services/folders/folders.service'
import { CreateFolerViewModel } from '../../../../shared/models/Repository/Create.model';
import { PracticeAreaService } from '../../../../shared/services/practice-areas/practice-areas.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Type } from '@angular/compiler/src/output/output_ast';
import { SubscriberFolderEntity, FolderEntity, FolderContentEntity } from '../../../../shared/models/folder';
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

    navigateToFolderDetails(subscriberClientID, clientDescription) {
        var input = { "subscriberClientID": subscriberClientID, "clientDescription": clientDescription };
        this._navigationService.navigate(PgConstants.constants.URLS.Folders.FolderDetails, new StateParams(input));
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
    saveCreatFolder = function () {
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
            if (val == 'Edit') {
                //this.editClient(folder);
            }
        }
    }
    cancelCreateClient() {
        this.newFolder = false;
        this.newClientFolder.clientDescription = "";
        this.newClientFolder.isValid = null;
    }
    openModal(template: TemplateRef<any>) {

        this.modalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
    }

    getFoldersMainFolderCount(subscriberClientId: number): number {
        let count = 0;

        var mainFolder = this.folderInfo.find(f => f.subscriberClientId == subscriberClientId);

        if (mainFolder && mainFolder.parentFolders) {
            count += mainFolder.parentFolders.length;
            mainFolder.parentFolders.forEach(p => {
                count += this.getFoldersCount(p.folders);
            });
        }
        return count;
    }

    getFilesMainFolderCount(subscriberClientId: number): number {
        let count = 0;
        var mainFolder = this.folderInfo.find(f => f.subscriberClientId == subscriberClientId);
        if (mainFolder && mainFolder.parentFolders) {
            mainFolder.parentFolders.forEach(p => {
                count += p.files.length;
                count += this.getFilesCount(p.folders);
            });
        }
        return count;
    }


    getFoldersCount(folders: FolderEntity[]): number {
        let folderCount = 0;
        folderCount += folders.length;
        folders.forEach(f => {
            if (f.folders) {
                folderCount += f.folders.length;
                f.folders.forEach(sf => {
                    if (sf.folders)
                        folderCount += this.getFoldersCount(sf.folders);
                });
            }
        });
        return folderCount;
    }

    getFilesCount(folders: FolderEntity[]): number {
        let filesCount = 0;

        folders.forEach(f => {
            filesCount += f.files.length;
            if (f.folders) {
                f.folders.forEach(sf => {
                    filesCount += sf.files.length;
                    if (sf.folders)
                        filesCount += this.getFilesCount(sf.folders);
                });
            }
        });
        return filesCount;
    }

    ngOnDestroy() {
        this.newFolder = null;
        this.newClientFolder.clientDescription = "";
    }

}
