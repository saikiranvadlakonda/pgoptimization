import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CreateFolerViewModel } from '../../../../shared/models/Repository/Create.model';
import { FoldersService } from '../../../../shared/services/folders/folders.service';
import { FolderDetailComponent } from '../folder-detail/folder-detail.component';
import { RouterProxy } from '../../../../store/router/proxy/router.proxy';
import { PgMessages } from '../../../constants/messages';
import { PgConstants } from '../../../constants/pg.constants';
import { ErrorModalService } from '../../../services/error-modal/error-modal.service';
import { ErrorContent } from '../../../models/error-content/error-content.model';
import { NewItemEntity } from '../../../models/whats-new/new-group.model';
import { DataStoreService } from '../../../services/data-store/data-store.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { StateParams } from '../../../models/state-params/state-params.model';
import { ContentService } from '../../../services/content/content.service';
import { GuidanceNoteService } from '../../../services/guidance-note/guidance-note.service';
import { RenderContentRequest } from '../../../models/dashboard/content-request.model';

@Component({
    selector: 'app-folder-container',
    templateUrl: './folder-container.component.html',
    styleUrls: ['./folder-container.component.scss'],
    providers: [ContentService]
})
export class FolderContainerComponent implements OnInit, OnDestroy {

    constructor(private _foldersService: FoldersService, private _routerProxy: RouterProxy, private _errorModalService: ErrorModalService, private _dataStoreService: DataStoreService, private _navigationService: NavigationService, private _contentService: ContentService, private _guidanceNoteService: GuidanceNoteService) { }

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
    practiceArea: string = "";
    rootArea: string = "";
    essentials;
    rendrContentRequest: RenderContentRequest = new RenderContentRequest();
    contentHTML;
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
    @ViewChild(FolderDetailComponent) folderDetailComponent: FolderDetailComponent;

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
            this.getFiles(folder, folder.subscriberClientId, "subscriberClientId");
        } else if (folder.folderNameId) {
            this.getFiles(folder, folder.folderNameId, "folderNameId");
        }
    }

    getFiles(folder, id, idType) {
        this._foldersService.getSelectedFoldersFiles(id).subscribe((folderDetails: any) => {
            if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                if (idType == "onFolderClick") {
                    folder['folders'] = JSON.parse(JSON.stringify(folderDetails.foldersList));
                    folder['files'] = JSON.parse(JSON.stringify(folderDetails.filesList));
                } else {
                    folder['folders'] = folderDetails.foldersList;
                    folder['files'] = folderDetails.filesList;
                }
                this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
            } else {
                folder['folders'] = [];
                folder['files'] = [];
                this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                if (idType == "onFolderClick") {
                    this.folderDetailsFileError = (Array.isArray(folderDetails.filesList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                } else {
                    this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
                }
            }

            this.clientFolder = folder;
            if (idType == "subscriberClientId") {
                this.breadCrumb = this.clientFolder.clientDescription;
                folder.folderName = folder.clientDescription
            } else {
                if (folder.folderNamePath && folder.folderNamePath.indexOf(">") != -1) {
                    var ffList = [];
                    var fNamePath = folder.folderNamePath.split(">");
                    var fNameIdPath = folder.folderNameIdPath.split(">");
                    if (fNamePath.length == fNameIdPath.length) {
                        for (var i = 0; i < fNamePath.length - 1; i++) {
                            if (i == 0) {
                                ffList.push({ 'subscriberClientId': fNameIdPath[i], 'clientDescription': fNamePath[i], 'folderName': fNamePath[i] });
                            } else
                                ffList.push({ 'folderNameId': fNameIdPath[i], 'folderName': fNamePath[i] });
                        }
                        this.selectedFolders = ffList;
                    }
                }
            }

            this.selectedFolders.push(folder);
            if (idType == "onFolderClick") {
                this.folderDetails = JSON.parse(JSON.stringify(folder));
                this.selectedFolder = folder;
            } else {
                this.currentSelection = 'folderDetails';
                this.folderDetails = folder;
            }

            this.currentViewSelection.emit(this.currentSelection);
            if (!this.isSaveToFolder)
                this.selectedFoldersList.emit(this.selectedFolders);
        });
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
        this.getFiles(folder, folder.folderNameId, "onFolderClick");
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
                this.showErrorMessage(PgMessages.constants.folders.addError);
            }
        });
    }

    onNewFolderAdd(folder) {
        var createFolder = new CreateFolerViewModel();
        createFolder.clientId = folder.subscriberClientId;
        createFolder.folderName = folder.folderName;
        createFolder.parentFolderId = folder.parentFolderId;
        if (this.selectedFolders.length == 1 && this.selectedFolders[0].subscriberClientId == this.folderDetails.subscriberClientId) {
            createFolder.parentFolderId = null;
            this._foldersService.CreateFolder(createFolder).subscribe(isCreated => {
                this.selectedFoldersFiles(isCreated, this.selectedFolders[0].subscriberClientId);
            });
        } else {
            this._foldersService.CreateFolder(createFolder).subscribe(isCreated => {
                this.selectedFoldersFiles(isCreated, createFolder.parentFolderId);
            });
        }
    }

    selectedFoldersFiles(isCreated, id) {
        if (isCreated) {
            this._foldersService.getSelectedFoldersFiles(id).subscribe((folderDetails: any) => {
                var folderData = {
                    folders: undefined,
                    files: undefined
                };
                Object.keys(this.folderDetails).forEach(key => {
                    folderData[key] = this.folderDetails[key];
                });
                if (folderDetails && ((folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid))) {
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
            this.showErrorMessage(PgMessages.constants.folders.addError);
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

    onClientFolderEdit(client) {
        var createFolder = new CreateFolerViewModel();
        createFolder.subscriberClientId = client.subscriberClientId;
        createFolder.clientDescription = client.clientDescription;
        this._foldersService.UpdateClient(createFolder).subscribe(isUpdated => {
            if (isUpdated) {
                this.getAllFolders();
            } else {
                this.showErrorMessage(PgMessages.constants.folders.renameError);
            }
        });
    }

    onClientFolderDelete(client) {
        var createFolder = new CreateFolerViewModel();
        createFolder.clientId = client.subscriberClientId;
        this._foldersService.DeleteClient(createFolder).subscribe(isDeleted => {
            if (isDeleted) {
                this.getAllFolders();
            } else {
                this.showErrorMessage(PgMessages.constants.folders.deleteError);
            }
        });
    }

    onEditFolder(folderContent) {
        var createFolder = new CreateFolerViewModel();
        createFolder.folderId = folderContent.editFolder.folderNameId;
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
                        this.getFoldersFiles(this.folderDetails.subscriberClientId, 'edit');
                    } else {
                        this.getFoldersFiles(this.folderDetails.folderNameId, 'edit');
                    }
                }
            } else {
                this.showErrorMessage(PgMessages.constants.folders.renameError);
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
                    });
                } else if (this.currentSelection == "folderDetails") {
                    if (this.selectedFolders.length == 1 && this.selectedFolders[0].subscriberClientId == this.folderDetails.subscriberClientId) {
                        this.getFoldersFiles(this.folderDetails.subscriberClientId, 'delete');
                    } else {
                        this.getFoldersFiles(this.folderDetails.folderNameId, 'delete');
                    }
                }
            } else {
                this.showErrorMessage(PgMessages.constants.folders.deleteError);
            }
        });
    }

    getFoldersFiles(id, action) {
        this._foldersService.getSelectedFoldersFiles(id).subscribe((folderDetails: any) => {
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

    markAsTouched() {
        this.isTitleTouched = true;
    }

    onSaveToFolder(folder) {
        if (this.saveToFolderContent.title == '' || this.saveToFolderContent.title == undefined) {
            this.isTitleTouched = true;
            return false;
        }

        var createFolder = new CreateFolerViewModel();
        createFolder.subscriberClientId = folder.subscriberClientId;
        createFolder.folderId = folder.folderNameId;
        createFolder.url = this.saveToFolderContent.url;
        createFolder.title = this.saveToFolderContent.title;
        if (this.saveToFolderContent.searchResult && this.saveToFolderContent.searchResult.length > 0) {
            this.saveFolderContent(createFolder, folder, 'searchResult');
        } else if (this.saveToFolderContent.essentialResult && this.saveToFolderContent.essentialResult.length > 0) {
            this.saveFolderContent(createFolder, folder, 'essentialResult');
        } else {
            this._foldersService.CreateDocument(createFolder).subscribe(isCreated => {
                if (!isCreated) {
                    this.showErrorMessage(PgMessages.constants.folders.saveError);
                }
                this.popUpCloseClick(true);
            });
        }
    }

    saveFolderContent(createFolder, folder, from) {
        this.saveToFolderContent[from].forEach(r => {
            createFolder.subscriberClientId = folder.subscriberClientId;
            createFolder.folderId = folder.folderNameId;
            if (from == 'searchResult') {
                createFolder.url = r.lmtIdPath;
                r.title = r.title.replace(new RegExp(`<span class='SearchHIT'>`, 'g'), "");
                r.title = r.title.replace(new RegExp(`</span>`, 'g'), "");
            } else {
                createFolder.url = r.domainPath;
            }

            createFolder.title = r.title;
            this._foldersService.CreateDocument(createFolder).subscribe(isCreated => {
                if (!isCreated) {
                    this.showErrorMessage(PgMessages.constants.folders.saveError);
                }
                this.popUpCloseClick(true);
            });
        });
    }

    onFileDelete(deleteContent) {
        this._foldersService.DeleteFolderFile(deleteContent.deletedId).subscribe(isDeleted => {
            var holdData = this.folderDetailComponent.folderDetails;
            if (isDeleted) {
                if (this.folderDetailComponent.folderDetails.folderNameId) {
                    this._foldersService.getSelectedFoldersFiles(this.folderDetailComponent.folderDetails.folderNameId).subscribe(data => {
                        data.files = data.filesList;
                        data.folders = data.foldersList;
                        data['folderNameId'] = this.folderDetailComponent.folderDetails.folderNameId;
                        this.folderDetailComponent.folderDetails = data;
                    });
                } else {
                    this._foldersService.getSelectedFoldersFiles(this.folderDetailComponent.folderDetails.subscriberClientId).subscribe(data => {
                        data.files = data.filesList;
                        data.folders = data.foldersList;
                        data['subscriberClientId'] = this.folderDetailComponent.folderDetails.subscriberClientId;
                        this.folderDetailComponent.folderDetails = data;
                    });
                }
            } else {
                this.showErrorMessage(PgMessages.constants.folders.fileDeleteError);
            }
        });
    }

    showErrorMessage(errorMessage) {
        let params: ErrorContent = {
            message: errorMessage,
            showOk: true,
            showCancel: false,
            callBack: undefined
        }
        this._errorModalService.open(params);
    }

    popUpCloseClick(isSaved) {
        this.saveToFolderContent = null;
        this.popUpClose.emit(isSaved);
    }

    navigateToParentFolder() {
        this.selectedFolders.pop();
        this.selectedFoldersList.emit(this.selectedFolders);
        this.navigateToThisFolder(this.selectedFolders[this.selectedFolders.length - 1]);
    }

    navigateToThisFolder(folder) {
        let folderIndex;
        if (folder != undefined && folder.subscriberClientId != undefined && folder.subscriberClientId != null) {
            this.getNavigatedFolderFiles(folder, folder.subscriberClientId, true);
        } else if (folder != undefined && folder.folderNameId != undefined && folder.subscriberClientId != null) {
            this.getNavigatedFolderFiles(folder, folder.folderNameId, false);

        } else if (folder != undefined && folder.folderNameId != undefined && folder.folderNameId != null) {
            this.getNavigatedFolderFiles(folder, folder.folderNameId, false);
        }

        if (folder == undefined && this.selectedFolders.length == 0) {
            this.currentSelection = "ClientList";
            this.getAllFolders();
            this.currentViewSelection.emit(this.currentSelection);
        }
    }

    getNavigatedFolderFiles(folder, id, checkFlag) {
        let folderIndex;
        this._foldersService.getSelectedFoldersFiles(id).subscribe(folderDetails => {
            if (folderDetails && ((folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid))) {
                if (checkFlag) {
                    folder['folders'] = folderDetails.foldersList;
                    folder['files'] = folderDetails.filesList;
                    this.clientFolder = folder;
                    folder.folderName = folder.clientDescription;
                    this.selectedFolders = [folder];
                    this.currentSelection = 'folderDetails';
                    this.folderDetails = folder;
                    this.selectedFolder = folder;
                    if (!this.isSaveToFolder)
                        this.selectedFoldersList.emit(this.selectedFolders);
                } else {
                    folder['folders'] = JSON.parse(JSON.stringify(folderDetails.foldersList));
                    folder['files'] = JSON.parse(JSON.stringify(folderDetails.filesList));
                    folderIndex = this.selectedFolders.findIndex(folderDetail => folder.folderNameId === folderDetail.folderNameId);
                    this.selectedFolders = this.selectedFolders.slice(0, folderIndex + 1);
                    this.folderDetails = JSON.parse(JSON.stringify(folder));
                    this.selectedFolder = folder;
                    this.selectedFoldersList.emit(this.selectedFolders);
                }

                this.folderDetailsError = (folderDetails.foldersList.length == 0) ? PgMessages.constants.folders.noFolders : undefined;
                this.folderDetailsFileError = (folderDetails.filesList.length == 0) ? PgMessages.constants.folders.noFiles : undefined;
            } else {
                folder['folders'] = [];
                folder['files'] = [];
                if (checkFlag) {
                    this.clientFolder = folder;
                    folder.folderName = folder.clientDescription;
                    this.selectedFolders = [folder];
                    this.currentSelection = 'folderDetails';
                    this.folderDetails = folder;
                    this.selectedFolder = folder;
                    if (!this.isSaveToFolder)
                        this.selectedFoldersList.emit(this.selectedFolders);
                } else {
                    folderIndex = this.selectedFolders.findIndex(folderDetail => folder.folderNameId === folderDetail.folderNameId);
                    this.selectedFolders = this.selectedFolders.slice(0, folderIndex + 1);
                    this.folderDetails = JSON.parse(JSON.stringify(folder));
                    this.selectedFolder = folder;
                    this.selectedFoldersList.emit(this.selectedFolders);
                }

                this.folderDetailsError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
                this.folderDetailsFileError = (Array.isArray(folderDetails.foldersList)) ? PgMessages.constants.folders.noFiles : PgMessages.constants.folders.error;
            }
        });
    }

    navigateToContent(data) {
        var file = new NewItemEntity();
        file.domainPath = data.url;
        file.hasChildren = "false";
        this._dataStoreService.setSessionStorageItem("selectedNewItem", file);
        this._dataStoreService.setSessionStorageItem("IsInlineDownload", true);
        this.setUrlFromDomainId(data);
    }

    private setUrlFromDomainId(data): void {
        var domainId = data.url;
        var title = data.title ? data.title : "";        
        var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
        var selectedPracticeArea = practiceAreas.find(nI => domainId.includes(nI.domainId));
        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);

        if (this.isPgDomainPath(domainId)) {
            let isPgSubPracticeAreaItem = this.isPgSubPracticeAreaItem("", domainId);
            data.domainPath = data.url;
            if (this.isPgDomainPath(domainId) || isPgSubPracticeAreaItem) {
                var topic = selectedPracticeArea.subTocItem.find(nI => domainId.includes(nI.domainId));
                if (!isPgSubPracticeAreaItem && topic == undefined) {
                    data.disablePermalink = true;
                    this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
                    this._dataStoreService.setSessionStorageItem("selectedNewItem", data);
                    this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
                } else {
                    this._contentService.navigateToContent(data);
                }
            } else {
                if (domainId.split('/').length === 5) {
                    var topic = selectedPracticeArea.subTocItem.find(nI => domainId.split('/')[3] == nI.domainId);
                    var subtopic = topic.subTocItem.find(nI => domainId.split('/')[domainId.split('/').length - 1] == nI.domainId);
                    subtopic.redirectedFrom = "folder-detail";
                    var input = { "subTopicDomainPath": subtopic.domainPath, "title": selectedPracticeArea.title + " > " + subtopic.title, "practiceArea": subtopic.title, "rootArea": selectedPracticeArea.title, "subTopic": subtopic };
                    this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
                }
                else if ((domainId.split('/').length > 5)) {
                    if (domainId.indexOf('isMultiView') > -1) {
                        var inputNote = { "title": null, "domainPath": domainId.split('|')[0] };
                        this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(inputNote));
                    }
                    else {                        
                        var topic = selectedPracticeArea.subTocItem ? selectedPracticeArea.subTocItem.find(nI => domainId.split('/')[3] == nI.domainId) : undefined;

                        if (topic == undefined) {
                            var newItems = this._dataStoreService.getSessionStorageItem("WhatsNews");
                            var newItem = newItems.find(nI => domainId == nI.domainPath);
                            this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
                            if (selectedPracticeArea.isSubscribed || (newItem.newsCategory.toLowerCase() == 'breaking news' || newItem.newsCategory.toLowerCase() == 'opinion piece')) {
                                this._dataStoreService.setSessionStorageItem("IsInlineDownload", false);
                                this._dataStoreService.setSessionStorageItem("selectedNewItem", newItem);
                                this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
                            }
                            this._navigationService.navigate(PgConstants.constants.URLS.ContentView.ContentView);
                        } else {
                            var subtopic = topic.subTocItem.find(nI => domainId.split('/')[4] == nI.domainId);
                            var domainPathLength = domainId.split('/').length;
                            var guidancedetail = {
                                "domainPath": data.url,
                                "domainId": domainId.split('/')[domainPathLength - 1],
                                "parentDomainId": domainId.split('/')[domainPathLength - 2],
                                "title": data.title,
                                "practiceArea": selectedPracticeArea.title,
                                "topic": subtopic.title,
                                "subtopic": subtopic,
                                "essentials": [],
                                "hasChildren": true
                            };

                            if (selectedPracticeArea.domainId == 'b2ioc' || selectedPracticeArea.domainId == 'nor6d') {
                                subtopic = subtopic.subTocItem.find(nI => domainId.split('/')[5] == nI.domainId);
                                subtopic.redirectedFrom = "folder-detail";
                                var input = { "subTopicDomainPath": subtopic.domainPath, "title": selectedPracticeArea.title + " > " + subtopic.title, "practiceArea": subtopic.title, rootArea: selectedPracticeArea.title, "subTopic": subtopic };
                                this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
                            } else {
                                this.practiceArea = subtopic.title;
                                this.rootArea = selectedPracticeArea.title;
                                let inputdata = {
                                    "practiceArea": subtopic.title,
                                    "rootArea": selectedPracticeArea.title,
                                    "subTopic": subtopic,
                                    "subTopicDomainPath": subtopic.domainPath,
                                    "title": selectedPracticeArea.title + " > " + subtopic.title,
                                }
                                this.getGNdetailData(inputdata, guidancedetail);
                            }
                        }
                    }
                }
                else {
                    this.getContent(domainId, title);
                }
            }
        }
        else { this.getContent(domainId, title); }
    }

    getGNdetailData(viewModel, guidanceDetail) {
        this._guidanceNoteService.getHomeContentForSubTopic(viewModel).subscribe(data => {
            var subTopicData = data;
            var guidances = [];            

            guidances = subTopicData.result.guidance;
            this._dataStoreService.setSessionStorageItem("Guidances", guidances);
            if (subTopicData.result["forms & precedents"] != null) {
                this.getEssentials(subTopicData.result["forms & precedents"], "Forms & Precedents");
            }
            if (subTopicData.result["checklists"] != null) {
                this.getEssentials(subTopicData.result["checklists"], "Checklists");
            }
            if (subTopicData.result["other resources"] != null) {
                this.getEssentials(subTopicData.result["other resources"], "Other Resources");
            }            
            guidanceDetail["guidances"] = guidances;
            guidanceDetail.essentials = this.essentials;
            guidanceDetail.redirectedFrom = "folder-detail";

            this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidanceDetail));
        }, error => {

        });

    }

    getEssentials(essentialsList, eType) {
        if (this.essentials == null)
            this.essentials = [];
        essentialsList.forEach(e => {
            e.subContentDomains.forEach(el => {
                el.eType = eType;
                el.guidance = this.rootArea + ' > ' + this.practiceArea;
                this.essentials.push(el);

            });
        })
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

    isPgDomainPath(domainPath: string) {
        return (domainPath.indexOf('a2ioc') > -1 ? true : false);
    }

    isPgModule(domainPath: string) {
        return (domainPath.indexOf('b2ioc') > -1 || domainPath.indexOf('nor6d') > -1 ? true : false);
    }


    isPgSubPracticeAreaItem(lmtTitlePath: string, domainPath: string) {
        let isPracAreaSubItem = false;

        if (lmtTitlePath != null && lmtTitlePath != 'undefined') {
            let lmtTitlePathArray = lmtTitlePath.split('|');

            let indexLen = 3;
            let topicLoc = 2;
            if (this.isPgModule(domainPath)) {
                indexLen++;
                topicLoc++;
            }
            //e.g. PGS|Civil Procedure|Introduction|Civil Procedure Introduction
            if (lmtTitlePathArray.length >= indexLen &&
                (
                    lmtTitlePathArray[topicLoc].toLowerCase() === 'introduction'
                    || lmtTitlePathArray[topicLoc].toLowerCase() === 'latest updates'
                    || lmtTitlePathArray[topicLoc].toLowerCase() === 'news'
                ))
                isPracAreaSubItem = true;
        }

        return (isPracAreaSubItem);
    }

    ngOnDestroy() {
        this.viewModelSubscription.unsubscribe();
    }
}