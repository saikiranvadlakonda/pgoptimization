import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { ContentService } from '../../../../shared/services/content/content.service';
import { FoldersService } from '../../../../shared/services/folders/folders.service';
import { PgMessages } from '../../../constants/messages';

@Component({
    selector: 'app-folders-list',
    templateUrl: './folders-list.component.html',
    styleUrls: ['./folders-list.component.scss'],
    providers: [ContentService]
})
export class FoldersListComponent implements OnInit {

    constructor(
        private _folderService: FoldersService
    ) { }

    folderInfoCopy;
    rendrContentRequest: RenderContentRequest = new RenderContentRequest();
    contentHTML;
    @Input() folderInfo;
    @Input() isSaveToFolder: boolean;
    @Input() error: string;
    @Output() selectedFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() addNewClientFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() editClientFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() deleteClientFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() navigateToContent: EventEmitter<any> = new EventEmitter<any>();
    showMoreFoldersBtn: boolean = true;
    searchFoldersCount = 5;
    isEnableNewFolder: boolean = true;
    currentEditFolder;
    fileFolderName = "";
    searchResult: any = null;
    fileError: string = "";
    firstError: string = "";

    ngOnInit() {
        this.firstError = this.error;
    }


    showFolderDetails(folder) {
        this.selectedFolder.emit(folder);
    }

    newClientFolder = {
        "folderNameId": null,
        "folderName": "",
        "parentFolderId": null,
        "subscriberClientId": null,
        "clientDescription": null,
        "subscriberId": null,
        "dateCreated": null,
        "lastAccessedDate": null,
        "isVisible": true,
        "isValid": null,
        "isNewFolder": true,
        "isEnableEdit": null,
        "folders": [],
        "files": []
    };

    createClientFolder() {
        if (this.isEnableNewFolder && !this.searchResult) {
            this.isEnableNewFolder = false;
            this.newClientFolder.isValid = null;
            this.newClientFolder.clientDescription = '';
            this.folderInfoCopy = JSON.parse(JSON.stringify(this.folderInfo));
            this.folderInfo.unshift(this.newClientFolder);
        }
    }

    cancelCreateClientFolder() {
        this.isEnableNewFolder = true;
        this.folderInfo.shift(this.newClientFolder);
        this.folderInfo = JSON.parse(JSON.stringify(this.folderInfoCopy));
    }

    addNewClient(folder) {
        if (folder) {
            if (folder.clientDescription) {
                this.isEnableNewFolder = true;
                folder.isValid = null;
                this.addNewClientFolder.emit(folder);
            } else {
                folder.isValid = false;
            }
        }
        
    }  

    enableEdit(folder) {
        if (!this.isEnableNewFolder && this.folderInfo && this.folderInfo.length > 0 && this.folderInfo[0].isNewFolder) {
            this.folderInfo.shift(this.newClientFolder);
        }
        this.isEnableNewFolder = false;
        this.currentEditFolder = JSON.parse(JSON.stringify(folder));
        this.disableAllFolderEdit();
        folder.isEnableEdit = true;
    }

    disableAllFolderEdit() {
        this.folderInfo.forEach(f => {
            f.isEnableEdit = null
        });
    }

    cancelEdit(folder) {
        this.isEnableNewFolder = true;
        folder.isValid = null;
        folder.clientDescription = this.currentEditFolder.clientDescription;
        folder.isEnableEdit = null;
    }

    editClient(folder) {
        folder.isValid = null;
        if (!folder.clientDescription || folder.clientDescription.trim() == '') {
            folder.isValid = false;
        }
        else {
            folder.isValid = null;
            this.isEnableNewFolder = true;
            folder.isEnableEdit = null;
            this.editClientFolder.emit(folder);
        }
    }

    deleteClient(folder) {
        if (!this.isEnableNewFolder) {
            this.isEnableNewFolder = true;
        }
        this.deleteClientFolder.emit(folder);
    }

    get FoldersCount() {
        if (this.folderInfo != undefined) {
            var folders = this.folderInfo.filter(f => f.isNewFolder == undefined);
            return folders.length;
        } else {
            return 0;
        }

    }

    onKeyDown(eventData: any) {
        if (eventData.event.keyCode == 13) {
            if (eventData.isCreatingNewFolder == 'New') {
                this.addNewClient(eventData.folder);
            }
            if (eventData.isCreatingNewFolder == 'Edit') {
                this.editClient(eventData.folder);
            }
        }
    }   

    forceSearch(event: KeyboardEvent) {
        if (event.keyCode == 13) {
            this.searchForFilesAndFolders();
        }
    }

    onNavigateToContent(data) {
        this.navigateToContent.emit(data);
    }

    searchForFilesAndFolders() {
        if (this.fileFolderName != "" && this.fileFolderName.length >= 2) {
            this._folderService.SearchAllFolder({ searchText: this.fileFolderName, folderId: 0 }).subscribe((folderDetails: any) => {
                if (folderDetails) {
                    if (folderDetails.isValid || (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid) || (folderDetails.rootFolders.length > 0 && folderDetails.rootFolders[0].isValid)) {
                        folderDetails.foldersList = folderDetails.foldersList.concat(folderDetails.rootFolders);
                        this.searchResult = folderDetails;
                        if (folderDetails.foldersList.length > 5) {
                            this.showMoreFoldersBtn = true;
                        } else {
                            this.showMoreFoldersBtn = false;
                        }
                        this.error = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                        this.fileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                    } else {
                        let searchResult = {
                            foldersList: [],
                            filesList: []
                        };
                        this.searchResult = searchResult;
                        this.error = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                        this.fileError = (Array.isArray(folderDetails.filesList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                        this.showMoreFoldersBtn = false;
                    }
                } else {
                    this.error = PgMessages.constants.folders.error;
                    this.fileError = PgMessages.constants.folders.error;
                    this.showMoreFoldersBtn = false;
                }
                
            });
        } 
    }

    clearSearch() {
        this.searchResult = null;
        this.fileFolderName = "";
        this.error = this.firstError;
    }

    showMoreFolders() {
        this.searchFoldersCount += 5;
        if (this.searchFoldersCount >= this.searchResult.foldersList.length) {
            this.showMoreFoldersBtn = false;
        }
    }

    showLessFolders() {
        this.searchFoldersCount = 5;
        this.showMoreFoldersBtn = true;
    }
}