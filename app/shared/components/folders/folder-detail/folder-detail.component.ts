import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { ContentService } from '../../../../shared/services/content/content.service';
import { FoldersService } from '../../../../shared/services/folders/folders.service';
import { EssentialService } from '../../../../shared/services/essential/essential-service';
import { GuidanceNoteService } from '../../../../shared/services/guidance-note/guidance-note.service';
import { PgMessages } from '../../../constants/messages';

@Component({
    selector: 'app-folder-detail',
    templateUrl: './folder-detail.component.html',
    styleUrls: ['./folder-detail.component.scss'],
    providers: [ContentService, EssentialService, GuidanceNoteService]
})
export class FolderDetailComponent implements OnInit {

    constructor(
        private _dataStoreService: DataStoreService,
        private _navigationService: NavigationService,
        private _contentService: ContentService,
        private _folderService: FoldersService,
        private _guidanceNoteService: GuidanceNoteService

    ) { }

    @Input()
    set folderDetails(_folderDetails) {
        this.folderData = _folderDetails;
        this.getFiles();
        this.getFolders();
    }
    get folderDetails() {
        return this.folderData;
    }

    @Input() breadCrumb;
    @Input() selectedFolders;
    @Input() folderError: string;
    @Input() fileError: string;
    @Output() folderBackClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() selectedFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() addNewFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() EditFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() folderDelete: EventEmitter<any> = new EventEmitter<any>();
    @Output() fileDelete: EventEmitter<any> = new EventEmitter<any>();
    @Output() saveToFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() popUpClose: EventEmitter<any> = new EventEmitter<any>();
    @Output() navigateToContent: EventEmitter<any> = new EventEmitter<any>();
    @Input() isSaveToFolder: boolean;
    checkedFolderId;
    folderContentId;
    searchResult;
    files;
    folders;
    foldersCopy;
    folderDataCopy;
    folderData;
    isEnableNewFolder: boolean = true;
    isEnableFolderEdit: boolean = false;
    fileFolderName = '';
    currentEditFolder;
    rendrContentRequest: RenderContentRequest = new RenderContentRequest();
    contentHTML;
    showMoreSearchFoldersBtn: boolean = true;
    searchFoldersCount = 5;
    foldersSize = 5;
    showMoreFoldersBtn: boolean = true;
    essentials;
    practiceArea: string = "";
    rootArea: string = "";
    firstFolderError: string;
    firstFileError: string;

    ngOnInit() {
        this.firstFolderError = this.folderError;
        this.firstFileError = this.fileError;
    }

    getFiles() {
        this.files = [];
        this.folderData.files.forEach(fl => {
            this.files.push(fl);
        });
    }

    getFolders() {
        this.folders = [];
        this.folderData.folders.forEach(fd => {
            this.folders.push(fd);
        });
    }
   
    navigateToFolder(folder) {
        this.isEnableNewFolder = true;
        if (!folder.isNewFolder)
            this.selectedFolder.emit(folder);
    }

    navigateToFolderFromSearch(folder) {
        this.searchResult = null;
        this.fileFolderName = "";
        this.navigateToFolder(folder);
    }

    newFolderBtnClick() {
        if (this.isEnableNewFolder && !this.searchResult) {
            this.foldersCopy = JSON.parse(JSON.stringify(this.folders));
            this.isEnableNewFolder = false;
            this.newFolder.isNewFolder = true;
            this.newFolder.folderName = null;
            this.newFolder.isValid = null;
            this.newFolder.parentFolderId = this.folderData.folderNameId;
            this.folders.unshift(this.newFolder);
        }
    }

    cancelNewFolder() {
        this.folders = JSON.parse(JSON.stringify(this.foldersCopy));
        this.isEnableNewFolder = true;
    }

    saveNewFolder(folder) {
        folder.isValid = null;
        if (!folder.folderName || folder.folderName.trim() == '') {
            folder.isValid = false;
        }
        else {
            this.isEnableNewFolder = true;
            if (this.folderData.folderNameId) {
                folder.parentFolderId = this.folderData.folderNameId;
            } else {
                folder.parentFolderId = this.folderData.subscriberClientId;
            }

            if (this.folderData.subscriberClientId) {
                folder.subscriberClientId = this.folderData.subscriberClientId;
                if (folder.parentFolderId == undefined) {
                    folder.parentFolderId = this.folderData.subscriberClientId;
                }
            } 

            folder.isValid = null;
            this.addNewFolder.emit(folder);
        }
    }    

    deleteFolder(folder) {
        var deleteContent = { "deletedId": folder.folderNameId, "parentFolder": this.folderData };
        this.folderDelete.emit(deleteContent);
    }

    deleteFile(file) {
        var deleteContent = { "deletedId": file.folderContentId, "parentFolder": this.folderData };
        this.fileDelete.emit(deleteContent);
    }

    OnSaveToFolderClick() {
        this.saveToFolder.emit(this.folderData);
    }

    onNavigateToContent(data) {
        this.navigateToContent.emit(data);
    }

    newFolder = {
        "folderNameId": null,
        "folderName": null,
        "parentFolderId": null,
        "subscriberClientId": null,
        "subscriberId": null,
        "dateCreated": null,
        "lastAccessedDate": null,
        "isVisible": null,
        "isValid": null,
        "isNewFolder": true,
        "isEnableEdit": null,
        "folders": [],
        "files": []
    }

    enableEdit(folder) {
        if (!this.isEnableNewFolder && this.folders && this.folders.length > 0 && this.folders[0].isNewFolder) {
            this.folders.shift(this.newFolder);
            this.isEnableNewFolder = false;
            this.newFolder.isNewFolder = false;
            this.newFolder.folderName = null;
            this.newFolder.isValid = null;
            this.newFolder.parentFolderId = null;
        }
        if (this.isEnableNewFolder) {
            this.isEnableNewFolder = false;
        }
        this.currentEditFolder = JSON.parse(JSON.stringify(folder));
        this.disableAllFolderEdit();
        folder.isEnableEdit = true;
    }

    disableAllFolderEdit() {
        this.folders.forEach(f => {
            f.isEnableEdit = null
        });
    }

    cancelEdit(folder) {
        folder.isValid = null;
        folder.folderName = this.currentEditFolder.folderName;
        folder.isEnableEdit = null;
        if (!this.isEnableNewFolder) {
            this.isEnableNewFolder = true;
        }
    }

    editChildFolder(folder) {
        folder.isValid = null;
        if (!folder.folderName || folder.folderName.trim() == '') {
            folder.isValid = false;
        }
        else {
            folder.isValid = null;
            var editConent = { "editFolder": folder, "parentFolder": this.folderData };
            this.EditFolder.emit(editConent);
        }
    }

    getDays(lastUpdateDate) {
        var today = new Date();
        var ldate = new Date(lastUpdateDate);
        var day = 1000 * 60 * 60 * 24;
        var diff = Math.floor(today.getTime() - ldate.getTime());
        if (Math.floor(diff / day) <= 0) {
            return (ldate.getHours() < 10 ? '0' + ldate.getHours() : ldate.getHours()) + ":" + (ldate.getMinutes() < 10 ? '0' + ldate.getMinutes() : ldate.getMinutes()) + ":" + (ldate.getSeconds() < 10 ? '0' + ldate.getSeconds() : ldate.getSeconds());
        }
        return Math.floor(diff / day) + " day(s) ago";
    }

    get FoldersCount() {
        var folders = this.folders.filter(f => f.isNewFolder == undefined);
        return folders.length;
    }

    popUpCloseClick(isSaved) {
        this.popUpClose.emit(isSaved);
    }

    onKeyDown(eventData: any) {
        if (eventData.event.keyCode == 13) {
            if (eventData.isCreatingNewFolder == 'New') {
                this.saveNewFolder(eventData.folder);
            }
            if (eventData.isCreatingNewFolder == 'Edit') {
                this.editChildFolder(eventData.folder);
            }
        }
    }

    getContent(dpath, title) {
        this.rendrContentRequest.dpath = dpath;
        this.rendrContentRequest.hasChildren = "false";
        this._contentService.downloadContent(this.rendrContentRequest).subscribe(data => {
            if (data.mimeType == "text/html") {
                this.contentHTML = this._contentService.cleanUpHTML(this._contentService.getHtmlContent(data.fileContent));
                var regex1 = new RegExp(title);
                this.contentHTML = this.contentHTML.replace(new RegExp(regex1, 'g'), ``);
                this.contentHTML = this.contentHTML.replace("<br />", ``);
                this._dataStoreService.setSessionStorageItem("htmlContent", this.contentHTML);
                this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
            }
            else
                this._contentService.downloadattachment(data.fileContent, data.fileName, data.mimeType);
        });
    }

    forceSearch(event: KeyboardEvent) {
        if (event.keyCode == 13) {
            this.searchForFilesAndFolders();
        }
    }

    searchForFilesAndFolders() {
        if (this.fileFolderName != "" && this.fileFolderName.length >= 2) {
            let folderId = [this.selectedFolders[this.selectedFolders.length - 1]];
            if (this.selectedFolders.length == 1) {
                folderId = this.selectedFolders[0]['subscriberClientId'];
            } else if (this.selectedFolders.length > 1) {
                folderId = [this.selectedFolders[this.selectedFolders.length - 1]][0]['folderNameId'];
            }
            if (folderId) {
                this._folderService.SearchInFolder({ searchText: this.fileFolderName, folderId: folderId }).subscribe((folderDetails: any) => {
                    if (folderDetails) {
                        if ((folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                            this.searchResult = folderDetails;
                            if (folderDetails.foldersList.length > 5) {
                                this.showMoreFoldersBtn = true;
                            } else {
                                this.showMoreFoldersBtn = false;
                            }
                            this.folderError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                            this.fileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                        } else {
                            let searchResult = {
                                foldersList: [],
                                filesList: []
                            };
                            this.searchResult = searchResult;
                            this.folderError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                            this.fileError = (Array.isArray(folderDetails.filesList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                            this.showMoreFoldersBtn = false;
                        }
                    } else {
                        this.folderError = PgMessages.constants.folders.error;
                        this.fileError = PgMessages.constants.folders.error;
                        this.showMoreFoldersBtn = false;
                    }
                    
                });
            }
        }
    }

    clearSearch() {
        this.searchResult = null;
        this.fileFolderName = "";
        this.folderError = this.firstFolderError;
        this.fileError = this.firstFileError;
    }

    showMoreFolders() {
        this.foldersSize += 5;
        if (this.foldersSize >= this.folders.length) {
            this.showMoreFoldersBtn = false;
        }
    }

    showLessFolders() {
        this.foldersSize = 5;
        this.showMoreFoldersBtn = true;
    }

    showMoreSearchFolders() {
        this.searchFoldersCount += 5;
        if (this.searchFoldersCount >= this.searchResult.foldersList.length) {
            this.showMoreSearchFoldersBtn = false;
        }
    }

    showLessSearchFolders() {
        this.searchFoldersCount = 5;
        this.showMoreSearchFoldersBtn = true;
    }

}
