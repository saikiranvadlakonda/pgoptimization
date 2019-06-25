import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CreateFolerViewModel } from '../../../../shared/models/Repository/Create.model';
import { FoldersService } from '../../../../shared/services/folders/folders.service';
import { FolderDetailComponent } from '../folder-detail/folder-detail.component';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { PgMessages } from '../../../constants/messages';
import { ErrorModalService } from '../../../services/error-modal/error-modal.service';
import { ErrorContent } from '../../../models/error-content/error-content.model';

@Component({
    selector: 'app-folder-container',
    templateUrl: './folder-container.component.html',
    styleUrls: ['./folder-container.component.scss']
})
export class FolderContainerComponent implements OnInit, OnDestroy {

    constructor(private _foldersService: FoldersService, private _routerProxy: RouterProxy, private _errorModalService: ErrorModalService) { }

    folderInfo;
    clientFolder;
    parentFolder;
    folderDetails;
    selectedFolder;
    currentSelection: string = 'ClientList';
    breadCrumb: string = '';
    selectedFolders = [];
    CreateFolder: CreateFolerViewModel = new CreateFolerViewModel();
    searchedFolder;
    isTitleTouched: boolean = false;
    isEditTitle: boolean = false;
    viewModelSubscription: any;
    folderError: string;
    folderDetailsError: string;
    folderDetailsFileError: string;
    @Input() isSaveToFolder: boolean;
    @Input() saveToFolderContent: any = {
        title: ""
    };
    @Output() selectedSaveToFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() popUpClose: EventEmitter<any> = new EventEmitter<any>();
    @Output() currentViewSelection: EventEmitter<any> = new EventEmitter<any>();
    @Output() selectedFoldersList: EventEmitter<any> = new EventEmitter<any>();
    @Input()
    set folderClick(clickedFolder) {
        if (clickedFolder == 0)
            this.navigateToParentFolder();
        else if (clickedFolder != undefined)
            this.navigateToThisFolder(clickedFolder);
    }
    get folderClick() {
        return this.selectedFolder;
    }
    //@ViewChild(FolderParentComponent) folderParentComponent: FolderParentComponent;
    @ViewChild(FolderDetailComponent) folderDetailComponent: FolderDetailComponent;

    newFolder = {
        "folderNameID": null,
        "folderName": null,
        "parentFolderID": null,
        "subscriberClientID": null,
        "subscriberID": null,
        "dateCreated": null,
        "lastAccessedDate": null,
        "isVisible": null,
        "isValid": null,
        "isNewFolder": true,
        "isEnableEdit": null,
        "folders": [],
        "files": []
    };

    ngOnInit() {

        this.viewModelSubscription = this._routerProxy.getViewModel().subscribe((viewModel) => {
            if (viewModel) {
                if (viewModel.isFolderDetails) {
                    this.onClientFolderClick(viewModel.folder);
                } else {
                    this.getAllFolders();
                }
            } else {
                this.getAllFolders();
            }
        });
    }

    onNavigateToThisFolder(folder) {
        this.navigateToThisFolder(folder);
    }

    onClientFolderClick(folder) {
        if (folder.subscriberClientId) {
            this._foldersService.getSelectedFoldersFiles(folder.subscriberClientId).subscribe((folderDetails: any) => {
                if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                    folder['folders'] = folderDetails.foldersList;
                    folder['files'] = folderDetails.filesList;
                    this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                    this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                } else {
                    folder['folders'] = [];
                    folder['files'] = [];
                    this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                    this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                }
                this.clientFolder = folder;
                this.breadCrumb = this.clientFolder.clientDescription;
                folder.folderName = folder.clientDescription;
                this.selectedFolders.push(folder);
                this.currentSelection = 'folderDetails';
                this.folderDetails = folder;
                this.currentViewSelection.emit(this.currentSelection);
                if (!this.isSaveToFolder)
                    this.selectedFoldersList.emit(this.selectedFolders);
            });
        } else if (folder.folderNameID) {

            this._foldersService.getSelectedFoldersFiles(folder.folderNameID).subscribe((folderDetails: any) => {
                if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                    folder['folders'] = folderDetails.foldersList;
                    folder['files'] = folderDetails.filesList;
                    this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                    this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                } else {
                    folder['folders'] = [];
                    folder['files'] = [];
                    this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                    this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                }
                this.clientFolder = folder;
                if (folder.folderNamePath && folder.folderNamePath.indexOf(">") != -1) {
                    var ffList = [];
                    var fNamePath = folder.folderNamePath.split(">");
                    var fNameIDPath = folder.folderNameIDPath.split(">");
                    if (fNamePath.length == fNameIDPath.length) {
                        for (var i = 0; i < fNamePath.length - 1; i++) {
                            if (i == 0) {
                                ffList.push({ 'subscriberClientId': fNameIDPath[i], 'clientDescription': fNamePath[i], 'folderName': fNamePath[i] });
                            } else
                                ffList.push({ 'folderNameID': fNameIDPath[i], 'folderName': fNamePath[i] });
                        }
                        this.selectedFolders = ffList;
                    }
                }
                this.selectedFolders.push(folder);
                this.currentSelection = 'folderDetails';
                this.folderDetails = folder;
                this.currentViewSelection.emit(this.currentSelection);
                if (!this.isSaveToFolder)
                    this.selectedFoldersList.emit(this.selectedFolders);
            });
        }
    }

    onParentFolderSelect(parentFolder) {

        this.parentFolder = parentFolder;
        this._foldersService.getSelectedFoldersFiles(parentFolder.folderNameID).subscribe(data => {
            parentFolder['folders'] = JSON.parse(JSON.stringify(data.foldersList));
            parentFolder['files'] = JSON.parse(JSON.stringify(data.filesList));
            //data['folderName'] = data.folderName;
            this.folderDetails = parentFolder;
            this.folderDetails['folderName'] = parentFolder.folderName;
            //this.folderDetails = parentFolder;
            this.currentSelection = 'folderDetails';
            this.breadCrumb = this.breadCrumb + ' > ' + this.folderDetails.folderName;
            this.selectedFolders.push(this.folderDetails);
        });
    }

    onParentFolderBackClick() {
        this.currentSelection = 'ClientList';
        this.breadCrumb = '';
        this.getAllFolders();
    }

    onFolderBackClick(val) {
        if (val == 'true') {
            this._foldersService.getSelectedFoldersFiles(this.clientFolder.subscriberClientId).subscribe(folderDetails => {

                if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                    this.clientFolder.files = folderDetails.filesList;
                    this.clientFolder.folders = folderDetails.foldersList;
                    this.currentSelection = 'parentFolder';
                    this.breadCrumb = this.clientFolder.clientDescription;
                    this.selectedFolders = [];

                    this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                    this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                } else {
                    this.clientFolder.files = [];
                    this.clientFolder.folders = [];
                    this.currentSelection = 'parentFolder';
                    this.breadCrumb = this.clientFolder.clientDescription;
                    this.selectedFolders = [];
                    this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                    this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                }
            });
        }
        else {
            this.setFoldersBreadCrumb();
        }
    }

    onFolderClick(folder) {
        this._foldersService.getSelectedFoldersFiles(folder.folderNameID).subscribe(folderDetails => {
            if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                folder['folders'] = JSON.parse(JSON.stringify(folderDetails.foldersList));
                folder['files'] = JSON.parse(JSON.stringify(folderDetails.filesList));
                this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
            } else {
                folder['folders'] = [];
                folder['files'] = [];
                this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                this.folderDetailsFileError = (Array.isArray(folderDetails.filesList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
            }
            folder['folders'] = JSON.parse(JSON.stringify(folderDetails.foldersList));
            folder['files'] = JSON.parse(JSON.stringify(folderDetails.filesList));
            if (folder.folderNamePath && folder.folderNamePath.indexOf(">") != -1) {
                var ffList = [];
                var fNamePath = folder.folderNamePath.split(">");
                var fNameIDPath = folder.folderNameIDPath.split(">");
                if (fNamePath.length == fNameIDPath.length) {
                    for (var i = 0; i < fNamePath.length - 1; i++) {
                        if (i == 0) {
                            ffList.push({ 'subscriberClientId': fNameIDPath[i], 'clientDescription': fNamePath[i], 'folderName': fNamePath[i] });
                        } else
                            ffList.push({ 'folderNameID': fNameIDPath[i], 'folderName': fNamePath[i] });
                    }
                    this.selectedFolders = ffList;
                }
            }
            this.clientFolder = folder;
            this.selectedFolders.push(folder);
            this.folderDetails = JSON.parse(JSON.stringify(folder));
            this.selectedFolder = folder;
            this.currentViewSelection.emit(this.currentSelection);
            if (!this.isSaveToFolder)
                this.selectedFoldersList.emit(this.selectedFolders);
        });
    }

    setFoldersBreadCrumb() {
        var folderBreadCrumb = '';
        this.selectedFolders.forEach(f => {
            folderBreadCrumb = (folderBreadCrumb == '') ? f.folderName : folderBreadCrumb + ' > ' + f.folderName;
        });
        this.breadCrumb = this.clientFolder.clientDescription + ' > ' + folderBreadCrumb;
    }

    onNewClientAdd(folder) {
        this.CreateFolder = new CreateFolerViewModel();
        this.CreateFolder.Createfolder = folder.clientDescription;
        this._foldersService.CreateClient(this.CreateFolder).subscribe(isCreated => {
            if (isCreated) {
                this.getAllFolders();
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

    onNewParentAdd(parentFolder) {
        var createFolder = new CreateFolerViewModel();
        createFolder.clientID = parentFolder.subscriberClientID;
        createFolder.folderName = parentFolder.folderName;
        createFolder.parentFolderID = null;
        this._foldersService.CreateFolder(createFolder).subscribe(data => {
            this._foldersService.getSelectedFoldersFiles(this.clientFolder.subscriberClientId).subscribe(data => {
                this.clientFolder.files = data.filesList;
                this.clientFolder.folders = data.foldersList;
                this.currentSelection = "parentFolder";
            });
        });
    }

    onNewFolderAdd(folder) {
        var createFolder = new CreateFolerViewModel();
        createFolder.clientID = folder.subscriberClientId;
        createFolder.folderName = folder.folderName;
        createFolder.parentFolderID = folder.parentFolderID;
        if (this.selectedFolders.length == 1 && this.selectedFolders[0].subscriberClientId == this.folderDetails.subscriberClientId) {
            createFolder.parentFolderID = null;
            this._foldersService.CreateFolder(createFolder).subscribe(isCreated => {
                if (isCreated) {
                    this._foldersService.getSelectedFoldersFiles(this.selectedFolders[0].subscriberClientId).subscribe((folderDetails: any) => {
                        var folderData = {
                            folders: undefined,
                            files: undefined
                        };
                        Object.keys(this.folderDetails).forEach(key => {
                            folderData[key] = this.folderDetails[key];
                        });
                        if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                            folderData['folders'] = JSON.parse(JSON.stringify(folderDetails.foldersList));
                            folderData['files'] = JSON.parse(JSON.stringify(folderDetails.filesList));
                            this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                            this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                        } else {
                            folderData['folders'] = [];
                            folderData['files'] = [];
                            this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                            this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                        }

                        this.folderDetails = folderData;
                        this.folderDetailComponent.folderData.files = folderData.files;
                        this.folderDetailComponent.folderData.folders = folderData.folders;
                        this.folderDetails.files = folderData.files;
                        this.folderDetails.folders = folderData.folders;
                        this.folderDetailComponent.getFiles();
                        this.folderDetailComponent.getFolders();
                    });
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
        } else {
            this._foldersService.CreateFolder(createFolder).subscribe(isCreated => {
                if (isCreated) {
                    this._foldersService.getSelectedFoldersFiles(createFolder.parentFolderID).subscribe((folderDetails: any) => {
                        var folderData = {
                            folders: undefined,
                            files: undefined
                        };
                        Object.keys(this.folderDetails).forEach(key => {
                            folderData[key] = this.folderDetails[key];
                        });
                        if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                            folderData['folders'] = JSON.parse(JSON.stringify(folderDetails.foldersList));
                            folderData['files'] = JSON.parse(JSON.stringify(folderDetails.filesList));
                            this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                            this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                        } else {
                            folderData['folders'] = [];
                            folderData['files'] = [];
                            this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                            this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                        }

                        this.folderDetails = folderData;
                        this.folderDetailComponent.folderData.files = folderData.files;
                        this.folderDetailComponent.folderData.folders = folderData.folders;
                        this.folderDetails.files = folderData.files;
                        this.folderDetails.folders = folderData.folders;
                        this.folderDetailComponent.getFiles();
                        this.folderDetailComponent.getFolders();
                    });
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

    getAllFolders(folder = null) {
        this._foldersService.getRootFolders().subscribe((folders: any) => {
            if (folders && folders.length > 0) {
                if (folders[0].isValid) {
                    this.folderInfo = folders;
                    this.folderError = undefined;
                } else {
                    this.folderInfo = [];
                    this.folderError = PgMessages.constants.folders.error;
                }
            } else {
                this.folderInfo = [];
                this.folderError = (Array.isArray(folders)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
            }
        });
    }

    setCurrentClientFolder() {
        this.clientFolder = this.folderInfo.find(c => c.subscriberClientId == this.clientFolder.subscriberClientId);
    }

    searchSelectedFolder(folder) {
        var parentFolder;
        if (this.clientFolder && this.clientFolder.parentFolders)
            parentFolder = this.clientFolder.parentFolders.find(p => p.folderNameID == this.parentFolder.folderNameID);
        if (parentFolder && (parentFolder.folderNameID == folder.parentFolderID || parentFolder.folderNameID == folder.folderNameID))
            this.folderDetails = JSON.parse(JSON.stringify(parentFolder));
        else if (parentFolder)
            this.searchFolders(parentFolder, folder.parentFolderID);
        else {
            this.searchFolders(this.selectedFolders[0], folder.folderName);
        }
    }

    searchFolders(parentFolder, folderId) {
        if (parentFolder && parentFolder.folderName == folderId) {
            this._foldersService.getSelectedFoldersFiles(parentFolder.folderNameID).subscribe(data => {
                parentFolder['folders'] = JSON.parse(JSON.stringify(data.foldersList));
                parentFolder['files'] = JSON.parse(JSON.stringify(data.filesList));
                parentFolder['folderName'] = parentFolder.folderName;
                this.folderDetails = parentFolder;
            });
            return;
        }

        var folder = parentFolder.folders.find(f => f.folderNameID == folderId);
        if (folder) {
            this.folderDetails = folder;
            return;
        }

        parentFolder.folders.forEach(f => {
            this.searchFolders(f, folderId);
        });
    }

    onClientFolderEdit(client) {
        var createFolder = new CreateFolerViewModel();
        createFolder.subscriberClientId = client.subscriberClientId;
        createFolder.clientDescription = client.clientDescription;
        this._foldersService.UpdateClient(createFolder).subscribe(isUpdated => {
            if (isUpdated) {
                this.getAllFolders();
            } else {
                let params: ErrorContent = {
                    message: PgMessages.constants.folders.renameError,
                    showOk: true,
                    showCancel: false,
                    callBack: undefined
                }
                this._errorModalService.open(params);
            }
        });
    }

    onClientFolderDelete(client) {
        var createFolder = new CreateFolerViewModel();
        createFolder.clientID = client.subscriberClientId;
        this._foldersService.DeleteClient(createFolder).subscribe(isDeleted => {
            if (isDeleted) {
                this.getAllFolders();
            } else {
                let params: ErrorContent = {
                    message: PgMessages.constants.folders.deleteError,
                    showOk: true,
                    showCancel: false,
                    callBack: undefined
                }
                this._errorModalService.open(params);
            }
        });
    }

    onEditFolder(folderContent) {
        var createFolder = new CreateFolerViewModel();
        createFolder.folderID = folderContent.editFolder.folderNameID;
        createFolder.folderName = folderContent.editFolder.folderName;
        this._foldersService.UpdateFolder(createFolder).subscribe(isUpdated => {
            if (isUpdated) {
                if (this.currentSelection == "parentFolder") {
                    this._foldersService.getSelectedFoldersFiles(this.clientFolder.subscriberClientId).subscribe(data => {
                        this.clientFolder.files = data.filesList;
                        this.clientFolder.folders = data.foldersList;
                    });
                } else if (this.currentSelection == "folderDetails") {
                    if (this.selectedFolders.length == 1 && this.selectedFolders[0].subscriberClientId == this.folderDetails.subscriberClientId) {
                        this._foldersService.getSelectedFoldersFiles(this.folderDetails.subscriberClientId).subscribe((folderDetails: any) => {

                            if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                                this.folderDetails.files = folderDetails.filesList;
                                this.folderDetails.folders = folderDetails.foldersList;
                                folderDetails.files = folderDetails.filesList;
                                folderDetails.folders = folderDetails.foldersList;
                                folderDetails.subscriberClientId = this.folderDetails.subscriberClientId;
                                this.folderDetailComponent.isEnableNewFolder = true;
                                this.folderDetailComponent.folderDetails = folderDetails;
                                this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                                this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                            } else {
                                this.folderDetails.files = [];
                                this.folderDetails.folders = [];
                                folderDetails.files = folderDetails.filesList;
                                folderDetails.folders = folderDetails.foldersList;
                                folderDetails.subscriberClientId = this.folderDetails.subscriberClientId;
                                this.folderDetailComponent.isEnableNewFolder = true;
                                this.folderDetailComponent.folderDetails = folderDetails;
                                this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                                this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                            }
                        });
                    } else {
                        this._foldersService.getSelectedFoldersFiles(this.folderDetails.folderNameID).subscribe((folderDetails: any) => {
                            if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                                this.folderDetails.files = folderDetails.filesList;
                                this.folderDetails.folders = folderDetails.foldersList;
                                folderDetails.files = folderDetails.filesList;
                                folderDetails.folders = folderDetails.foldersList;
                                folderDetails.subscriberClientId = this.folderDetails.subscriberClientId;
                                this.folderDetailComponent.isEnableNewFolder = true;
                                this.folderDetailComponent.folderDetails = folderDetails;
                                this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                                this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                            } else {
                                this.folderDetails.files = [];
                                this.folderDetails.folders = [];
                                folderDetails.files = folderDetails.filesList;
                                folderDetails.folders = folderDetails.foldersList;
                                folderDetails.subscriberClientId = this.folderDetails.subscriberClientId;
                                this.folderDetailComponent.isEnableNewFolder = true;
                                this.folderDetailComponent.folderDetails = folderDetails;
                                this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                                this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                            }
                        });
                    }

                }
            } else {
                let params: ErrorContent = {
                    message: PgMessages.constants.folders.renameError,
                    showOk: true,
                    showCancel: false,
                    callBack: undefined
                }
                this._errorModalService.open(params);
            }
        });
    }

    onFolderDelete(deleteContent) {
        this._foldersService.DeleteFolder(deleteContent.deletedId).subscribe(isDeleted => {
            if (isDeleted) {
                if (this.currentSelection == "parentFolder") {
                    this._foldersService.getSelectedFoldersFiles(this.clientFolder.subscriberClientId).subscribe(data => {
                        this.clientFolder.files = data.filesList;
                        this.clientFolder.folders = data.foldersList;
                        //this.folderParentComponent.clientFolder = this.clientFolder;
                        //this.folderParentComponent.getFolders();
                    });
                } else if (this.currentSelection == "folderDetails") {
                    if (this.selectedFolders.length == 1 && this.selectedFolders[0].subscriberClientId == this.folderDetails.subscriberClientId) {
                        this._foldersService.getSelectedFoldersFiles(this.folderDetails.subscriberClientId).subscribe((folderDetails: any) => {

                            if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                                folderDetails.files = folderDetails.filesList;
                                folderDetails.folders = folderDetails.foldersList;
                                folderDetails.subscriberClientId = this.folderDetails.subscriberClientId;
                                this.folderDetails.files = folderDetails.files;
                                this.folderDetails.folders = folderDetails.folders;
                                this.folderDetailComponent.isEnableNewFolder = true;
                                this.folderDetailComponent.folderDetails = folderDetails;
                                this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                                this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                            } else {
                                this.folderDetails.files = [];
                                this.folderDetails.folders = [];
                                folderDetails.files = folderDetails.filesList;
                                folderDetails.folders = folderDetails.foldersList;
                                folderDetails.subscriberClientId = this.folderDetails.subscriberClientId;
                                this.folderDetailComponent.isEnableNewFolder = true;
                                this.folderDetailComponent.folderDetails = folderDetails;
                                this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                                this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                            }
                        });
                    } else {
                        this._foldersService.getSelectedFoldersFiles(this.folderDetails.folderNameID).subscribe((folderDetails: any) => {
                            if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                                folderDetails.files = folderDetails.filesList;
                                folderDetails.folders = folderDetails.foldersList;
                                folderDetails.subscriberClientId = this.folderDetails.subscriberClientId;
                                this.folderDetails.files = folderDetails.files;
                                this.folderDetails.folders = folderDetails.folders;
                                this.folderDetailComponent.isEnableNewFolder = true;
                                this.folderDetailComponent.folderDetails = folderDetails;
                                this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                                this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                            } else {
                                this.folderDetails.files = [];
                                this.folderDetails.folders = [];
                                folderDetails.files = folderDetails.filesList;
                                folderDetails.folders = folderDetails.foldersList;
                                folderDetails.subscriberClientId = this.folderDetails.subscriberClientId;
                                this.folderDetailComponent.isEnableNewFolder = true;
                                this.folderDetailComponent.folderDetails = folderDetails;
                                this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                                this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                            }
                        });
                    }

                }
            } else {
                let params: ErrorContent = {
                    message: PgMessages.constants.folders.deleteError,
                    showOk: true,
                    showCancel: false,
                    callBack: undefined
                }
                this._errorModalService.open(params);
            }
        });
    }

    markAsTouched() {
        this.isTitleTouched = true;
    }

    onSaveToFolder(folder) {
        if (this.saveToFolderContent.title == '' || this.saveToFolderContent.title == undefined) {
            this.isTitleTouched = true;
            return false;
        }

        var createFolder = new CreateFolerViewModel();
        createFolder.subscriberClientId = folder.subscriberClientID;
        createFolder.folderID = folder.folderNameID;
        createFolder.url = this.saveToFolderContent.url;
        createFolder.title = this.saveToFolderContent.title;
        if (this.saveToFolderContent.searchResult && this.saveToFolderContent.searchResult.length > 0) {
            this.saveToFolderContent.searchResult.forEach(r => {
                createFolder.subscriberClientId = folder.subscriberClientID;
                createFolder.folderID = folder.folderNameID;
                createFolder.url = r.lmtIDPath;
                r.title = r.title.replace(new RegExp(`<span class='SearchHIT'>`, 'g'), "");
                r.title = r.title.replace(new RegExp(`</span>`, 'g'), "");
                createFolder.title = r.title;
                this._foldersService.CreateDocument(createFolder).subscribe(isCreated => {
                    if (!isCreated) {
                        let params: ErrorContent = {
                            message: PgMessages.constants.folders.saveError,
                            showOk: true,
                            showCancel: false,
                            callBack: undefined
                        }
                        this._errorModalService.open(params);
                    }
                    this.popUpCloseClick(true);
                });
            });
        } else if (this.saveToFolderContent.essentialResult && this.saveToFolderContent.essentialResult.length > 0) {
            this.saveToFolderContent.essentialResult.forEach(r => {
                createFolder.subscriberClientId = folder.subscriberClientID;
                createFolder.folderID = folder.folderNameID;
                createFolder.url = r.domainPath;
                createFolder.title = r.title;
                this._foldersService.CreateDocument(createFolder).subscribe(isCreated => {
                    if (!isCreated) {
                        let params: ErrorContent = {
                            message: PgMessages.constants.folders.saveError,
                            showOk: true,
                            showCancel: false,
                            callBack: undefined
                        }
                        this._errorModalService.open(params);
                    }
                    this.popUpCloseClick(true);
                });
            });
        } else {
            this._foldersService.CreateDocument(createFolder).subscribe(isCreated => {
                if (!isCreated) {
                    let params: ErrorContent = {
                        message: PgMessages.constants.folders.saveError,
                        showOk: true,
                        showCancel: false,
                        callBack: undefined
                    }
                    this._errorModalService.open(params);
                }
                this.popUpCloseClick(true);
            });
        }

    }

    onSavedFileToFolder(): void {
        this.selectedSaveToFolder.emit();
    }

    onFileDelete(deleteContent) {
        this._foldersService.DeleteFolderFile(deleteContent.deletedId).subscribe(isDeleted => {
            var holdData = this.folderDetailComponent.folderDetails;
            if (isDeleted) {
                if (this.folderDetailComponent.folderDetails.folderNameID) {
                    this._foldersService.getSelectedFoldersFiles(this.folderDetailComponent.folderDetails.folderNameID).subscribe(data => {
                        data.files = data.filesList;
                        data.folders = data.foldersList;
                        data['folderNameID'] = this.folderDetailComponent.folderDetails.folderNameID;
                        this.folderDetailComponent.folderDetails = data;

                        //this.folderDetailComponent.folderDetails.folders = data.folders;
                    });
                } else {
                    this._foldersService.getSelectedFoldersFiles(this.folderDetailComponent.folderDetails.subscriberClientID).subscribe(data => {
                        data.files = data.filesList;
                        data.folders = data.foldersList;
                        data['subscriberClientID'] = this.folderDetailComponent.folderDetails.subscriberClientID;
                        this.folderDetailComponent.folderDetails = data;
                        //this.folderDetailComponent.folderDetails.folders = data.folders;
                    });
                }

                /*if (this.selectedFolders[this.selectedFolders.length - 1].subscriberClientId) {
                    this._foldersService.getSelectedFoldersFiles(this.folderDetailComponent.folderDetails.folderNameId).subscribe(data => {
                        data.files = data.filesList;
                        data.folders = data.foldersList;
                        this.folderDetailComponent.folderDetails = data;
                        //this.folderDetailComponent.folderDetails.folders = data.folders;
                    });
                } else if (this.selectedFolders[this.selectedFolders.length - 1].folderNameID) {
                    this._foldersService.getSelectedFoldersFiles(this.folderDetailComponent.folderDetails.folderNameId).subscribe(data => {
                        data.files = data.filesList;
                        data.folders = data.foldersList;
                        this.folderDetailComponent.folderDetails = data;
                        //this.folderDetailComponent.folderDetails.folders = data.folders;
                    });
                }
                //this._foldersService.getSelectedFoldersFiles(this.folderDetailComponent.folderDetails.folderNameId).subscribe(data => {
                //    this.folderDetailComponent.folderDetails.files = data.files;
                //    this.folderDetailComponent.folderDetails.folders = data.folders;
                //});*/
            } else {
                let params: ErrorContent = {
                    message: PgMessages.constants.folders.fileDeleteError,
                    showOk: true,
                    showCancel: false,
                    callBack: undefined
                }
                this._errorModalService.open(params);
            }
        });
    }

    popUpCloseClick(isSaved) {
        this.saveToFolderContent = null;
        this.popUpClose.emit(isSaved);
    }

    navigateToParentFolder() {
        this.selectedFolders.pop();
        this.selectedFoldersList.emit(this.selectedFolders);
        this.navigateToThisFolder(this.selectedFolders[this.selectedFolders.length - 1]);

        //this.selectedFolders = [];
        //this.currentSelection = 'ClientList';
        //this.getAllFolders();
        //this.currentViewSelection.emit(this.currentSelection);
        /*
        var selectedFolderCount = this.selectedFolders.length;
        if (selectedFolderCount == 1) {
            //this.isEnableNewFolder = true;
            //this.folderBackClick.emit('true');
            this.selectedFolders = [];
        }

        else {
            if (selectedFolderCount == 1) {
                //this.folderData = JSON.parse(JSON.stringify(this.selectedFolders[this.selectedFolders.length - 1]));
                this.selectedFolders = [];
            }
            else {
                //this.folderData = JSON.parse(JSON.stringify(this.selectedFolders[this.selectedFolders.length - 1]));
            }
            this._folderService.getSelectedFoldersFiles(this.folderData.folderNameID).subscribe(data => {
                this.folderData.files = data.filesList;
                this.folderData.folders = data.foldersList;
                this.getFiles();
                this.getFolders();
                this.folderBackClick.emit('false');
            });
            
        }*/
    }

    navigateToThisFolder(folder) {
        let folderIndex;
        //this.selectedFolders.slice(this.selectedFolders.indexOf(folder));
        //this.folderDetails = folder;
        /*if (folder != undefined && folder.subscriberClientId != undefined && folder.subscriberClientId != null) {
            this._foldersService.getSelectedFoldersFiles(folder.subscriberClientId).subscribe(data => {
                folder['folders'] = data.foldersList;
                folder['files'] = data.filesList;
                this.clientFolder = folder;
                //this.breadCrumb = this.clientFolder.clientDescription;
                folder.folderName = folder.clientDescription;
                this.selectedFolders = [folder];
                this.currentSelection = 'folderDetails';
                this.folderDetails = folder;
                this.selectedFolder = folder;
                if (!this.isSaveToFolder)
                    this.selectedFoldersList.emit(this.selectedFolders);
            });
        } else if (folder != undefined && folder.folderNameId != undefined && folder.subscriberClientId != null) {

            this._foldersService.getSelectedFoldersFiles(folder.folderNameId).subscribe(data => {
                folder['folders'] = JSON.parse(JSON.stringify(data.foldersList));
                folder['files'] = JSON.parse(JSON.stringify(data.filesList));
                //folder['folderName'] = folder.folderName;
                folderIndex = this.selectedFolders.findIndex(folderDetail => folder.folderNameId === folderDetail.folderNameId);
                this.selectedFolders = this.selectedFolders.slice(0, folderIndex + 1);
                this.folderDetails = JSON.parse(JSON.stringify(folder));
                this.selectedFolder = folder;
                //this.setFoldersBreadCrumb();
                this.selectedFoldersList.emit(this.selectedFolders);
                if (!this.isSaveToFolder)
                    this.selectedFoldersList.emit(this.selectedFolders);
            });
        } else if (folder != undefined && folder.folderNameID != undefined && folder.folderNameID != null) {
            this._foldersService.getSelectedFoldersFiles(folder.folderNameID).subscribe(data => {
                folder['folders'] = JSON.parse(JSON.stringify(data.foldersList));
                folder['files'] = JSON.parse(JSON.stringify(data.filesList));
                //folder['folderName'] = folder.folderName;
                folderIndex = this.selectedFolders.findIndex(folderDetail => folder.folderNameID === folderDetail.folderNameID);
                this.selectedFolders = this.selectedFolders.slice(0, folderIndex + 1);
                this.folderDetails = JSON.parse(JSON.stringify(folder));
                this.selectedFolder = folder;
                //this.setFoldersBreadCrumb();
                this.selectedFoldersList.emit(this.selectedFolders);
                if (!this.isSaveToFolder)
                    this.selectedFoldersList.emit(this.selectedFolders);
            });
        }*/

        if (folder != undefined && folder.subscriberClientId != undefined && folder.subscriberClientId != null) {
            this._foldersService.getSelectedFoldersFiles(folder.subscriberClientId).subscribe(folderDetails => {
                if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                    folder['folders'] = folderDetails.foldersList;
                    folder['files'] = folderDetails.filesList;
                    this.clientFolder = folder;
                    //this.breadCrumb = this.clientFolder.clientDescription;
                    folder.folderName = folder.clientDescription;
                    this.selectedFolders = [folder];
                    this.currentSelection = 'folderDetails';
                    this.folderDetails = folder;
                    this.selectedFolder = folder;
                    if (!this.isSaveToFolder)
                        this.selectedFoldersList.emit(this.selectedFolders);
                    this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                    this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                } else {
                    folder['folders'] = [];
                    folder['files'] = [];
                    this.clientFolder = folder;
                    folder.folderName = folder.clientDescription;
                    this.selectedFolders = [folder];
                    this.currentSelection = 'folderDetails';
                    this.folderDetails = folder;
                    this.selectedFolder = folder;
                    if (!this.isSaveToFolder)
                        this.selectedFoldersList.emit(this.selectedFolders);
                    this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                    this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                }
            });
        } else if (folder != undefined && folder.folderNameId != undefined && folder.subscriberClientId != null) {

            this._foldersService.getSelectedFoldersFiles(folder.folderNameId).subscribe(folderDetails => {
                if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                    folder['folders'] = JSON.parse(JSON.stringify(folderDetails.foldersList));
                    folder['files'] = JSON.parse(JSON.stringify(folderDetails.filesList));
                    //folder['folderName'] = folder.folderName;
                    folderIndex = this.selectedFolders.findIndex(folderDetail => folder.folderNameId === folderDetail.folderNameId);
                    this.selectedFolders = this.selectedFolders.slice(0, folderIndex + 1);
                    this.folderDetails = JSON.parse(JSON.stringify(folder));
                    this.selectedFolder = folder;
                    //this.setFoldersBreadCrumb();
                    this.selectedFoldersList.emit(this.selectedFolders);
                    if (!this.isSaveToFolder)
                        this.selectedFoldersList.emit(this.selectedFolders);
                    this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                    this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                } else {
                    folder['folders'] = [];
                    folder['files'] = [];
                    folderIndex = this.selectedFolders.findIndex(folderDetail => folder.folderNameId === folderDetail.folderNameId);
                    this.selectedFolders = this.selectedFolders.slice(0, folderIndex + 1);
                    this.folderDetails = JSON.parse(JSON.stringify(folder));
                    this.selectedFolder = folder;
                    this.selectedFoldersList.emit(this.selectedFolders);
                    if (!this.isSaveToFolder)
                        this.selectedFoldersList.emit(this.selectedFolders);
                    this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                    this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                }
            });
        } else if (folder != undefined && folder.folderNameID != undefined && folder.folderNameID != null) {
            this._foldersService.getSelectedFoldersFiles(folder.folderNameID).subscribe(folderDetails => {
                if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                    folder['folders'] = JSON.parse(JSON.stringify(folderDetails.foldersList));
                    folder['files'] = JSON.parse(JSON.stringify(folderDetails.filesList));
                    //folder['folderName'] = folder.folderName;
                    folderIndex = this.selectedFolders.findIndex(folderDetail => folder.folderNameID === folderDetail.folderNameID);
                    this.selectedFolders = this.selectedFolders.slice(0, folderIndex + 1);
                    this.folderDetails = JSON.parse(JSON.stringify(folder));
                    this.selectedFolder = folder;
                    //this.setFoldersBreadCrumb();
                    this.selectedFoldersList.emit(this.selectedFolders);
                    if (!this.isSaveToFolder)
                        this.selectedFoldersList.emit(this.selectedFolders);
                    this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                    this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
                } else {
                    folder['folders'] = [];
                    folder['files'] = [];
                    folderIndex = this.selectedFolders.findIndex(folderDetail => folder.folderNameID === folderDetail.folderNameID);
                    this.selectedFolders = this.selectedFolders.slice(0, folderIndex + 1);
                    this.folderDetails = JSON.parse(JSON.stringify(folder));
                    this.selectedFolder = folder;
                    this.selectedFoldersList.emit(this.selectedFolders);
                    if (!this.isSaveToFolder)
                        this.selectedFoldersList.emit(this.selectedFolders);
                    this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                    this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                }
            });
        }


        if (folder == undefined && this.selectedFolders.length == 0) {
            this.currentSelection = "ClientList";
            this.getAllFolders();
            this.currentViewSelection.emit(this.currentSelection);

        }

    }

    ngOnDestroy() {
        this.viewModelSubscription.unsubscribe();
    }
}