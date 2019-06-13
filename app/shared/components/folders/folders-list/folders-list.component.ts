import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NewItemEntity } from '../../../../shared/models/whats-new/new-group.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
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
        private _dataStoreService: DataStoreService,
        private _navigationService: NavigationService,
        private _contentService: ContentService,
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
    showMoreFoldersBtn: boolean = true;
    searchFoldersCount = 5;
    isEnableNewFolder: boolean = true;
    currentEditFolder;
    fileFolderName;
    searchResult;
    fileError: string;
    firstError: string;

    ngOnInit() {
        this.firstError = this.error;
    }


    showFolderDetails(folder) {
        this.selectedFolder.emit(folder);
    }

    newClientFolder = {
        "folderNameID": null,
        "folderName": "",
        "parentFolderID": null,
        "subscriberClientID": null,
        "clientDescription": null,
        "subscriberID": null,
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
        if (folder && folder.clientDescription) {
            this.isEnableNewFolder = true;
            folder.isValid = null;
            this.addNewClientFolder.emit(folder);
        } else {
            folder.isValid = false;
        }
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


    getFoldersCount(folders): number {
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

    getFilesCount(folders): number {
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

    enableEdit(folder) {
        if (!this.isEnableNewFolder && this.folderInfo && this.folderInfo.length > 0 && this.folderInfo[0].isNewFolder) {
            this.folderInfo.shift(this.newClientFolder);
            //this.folderInfo = JSON.parse(JSON.stringify(this.folderInfoCopy));
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

    onKeyDown(event, folder, val) {
        if (event.keyCode == 13) {
            if (val == 'New') {
                this.addNewClient(folder);
            }
            if (val == 'Edit') {
                this.editClient(folder);
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
            this._folderService.SearchAllFolder({ searchText: this.fileFolderName, folderId: 0 }).subscribe((folderDetails: any) => {
                if (folderDetails && folderDetails.isValid || (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid) || (folderDetails.rootFolders.length > 0 && folderDetails.rootFolders[0].isValid)) {
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
            });

            //this.setParameter();
        } else {
            //modalContentAlert
            //this.modalAlertRef = this.modalService.show(this.modalContentAlert);
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