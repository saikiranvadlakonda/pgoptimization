import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NewItemEntity } from '../../../../shared/models/whats-new/new-group.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
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
        private _essentialService: EssentialService,
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

    navigateToParentFolder() {

        var selectedFolderCount = this.selectedFolders.length;
        if (selectedFolderCount == 1) {
            this.isEnableNewFolder = true;
            this.folderBackClick.emit('true');
            this.selectedFolders = [];
        }

        else {
            if (selectedFolderCount == 1) {
                this.folderData = JSON.parse(JSON.stringify(this.selectedFolders[this.selectedFolders.length - 1]));
                this.selectedFolders = [];
            } else {
                this.folderData = JSON.parse(JSON.stringify(this.selectedFolders[this.selectedFolders.length - 1]));
            }
            this._folderService.getSelectedFoldersFiles(this.folderData.folderNameID).subscribe(folderDetails => {
                if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                    this.folderData.files = folderDetails.filesList;
                    this.folderData.folders = folderDetails.foldersList;
                } else {
                    this.folderData.files = [];
                    this.folderData.folders = [];
                }

                this.getFiles();
                this.getFolders();
                this.folderBackClick.emit('false');
            });

        }
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
            this.newFolder.parentFolderID = this.folderData.folderNameID;
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
            if (this.folderData.folderNameID) {
                folder.parentFolderID = this.folderData.folderNameID;
            } else {
                folder.parentFolderID = this.folderData.subscriberClientID;
            }

            if (this.folderData.subscriberClientID) {
                folder.subscriberClientId = this.folderData.subscriberClientID;
                if (folder.parentFolderID == undefined) {
                    folder.parentFolderID = this.folderData.subscriberClientID;
                }
            } else if (this.folderData.subscriberClientId) {
                folder.subscriberClientId = this.folderData.subscriberClientId;
                if (folder.parentFolderID == undefined) {
                    folder.parentFolderID = this.folderData.subscriberClientId;
                }
            }

            folder.isValid = null;
            this.addNewFolder.emit(folder);
        }
    }

    folderEditClick() {
        this.folderDataCopy = JSON.parse(JSON.stringify(this.folderData));
        this.isEnableFolderEdit = true;
    }

    cancelFolderEdit() {
        this.folderData = JSON.parse(JSON.stringify(this.folderDataCopy));
        this.isEnableFolderEdit = false;

    }

    folderEdit() {
        this.isEnableFolderEdit = false;
        this.EditFolder.emit(this.folderData);
    }

    onFolderCheck(folderId) {
        this.checkedFolderId = folderId;
        this.folderContentId = undefined;
    }

    deleteFolder(folder) {
        var deleteContent = { "deletedId": folder.folderNameID, "parentFolder": this.folderData };
        this.folderDelete.emit(deleteContent);
    }

    deleteFile(file) {
        var deleteContent = { "deletedId": file.folderContentID, "parentFolder": this.folderData };
        this.fileDelete.emit(deleteContent);
    }

    OnSaveToFolderClick() {
        this.saveToFolder.emit(this.folderData);
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
        var paTitle = data.title;
        var paDomainId = domainId.split('/')[2];
        var practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
        var selectedPracticeArea = practiceAreas.find(nI => domainId.includes(nI.domainId));
        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
        // this.getEssential();

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
                    //  var input = { "subTopicDomainPath": domainId, "title": null, "practiceArea": null, rootArea: null };
                    this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
                }
                else if ((domainId.split('/').length > 5)) {
                    if (domainId.indexOf('isMultiView') > -1) {
                        var inputNote = { "title": null, "domainPath": domainId.split('|')[0] };
                        this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(inputNote));
                    }
                    else {
                        var inputNotedet = { "title": title, "domainPath": domainId };
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
                            else {
                                //this._modalService.open();
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
                                // this.getEssential(guidancedetail); 
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

                        //this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidancedetail));
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
            var commentarys = [];
            var legislations = [];
            var caseLaws = [];

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
            commentarys = subTopicData.result.commentary;
            legislations = subTopicData.result.legislation;
            caseLaws = subTopicData.result["case law"];
            guidanceDetail["guidances"] = guidances;
            guidanceDetail.essentials = this.essentials;
            guidanceDetail.redirectedFrom = "folder-detail";

            this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidanceDetail));
        }, error => {

            //this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(guidanceDetail));
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

    getEssential() {

        var subTopics = [];
        var selectedPracticeArea = this._dataStoreService.getSessionStorageItem("SelectedPracticeArea");

        selectedPracticeArea.subTocItem.forEach(s => {
            subTopics.push(s);
        });

        this._essentialService.getEssential(subTopics).subscribe(data => {
            this.essentials = [];
            var topics = data;
            topics.forEach(topic => {
                if (topic.essentials) {
                    topic.essentials.forEach(e => {
                        e.subContentDomains.forEach(s => {
                            s.eType = topic.pageType;
                            s.guidance = topic.subTopicName;
                            this.essentials.push(s);

                        });
                    });

                }
            });
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

    setFolderContendID(folderContentId) {
        this.folderContentId = folderContentId;
        this.checkedFolderId = undefined;
    }


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
    }

    enableEdit(folder) {
        if (!this.isEnableNewFolder && this.folders && this.folders.length > 0 && this.folders[0].isNewFolder) {
            this.folders.shift(this.newFolder);
            this.isEnableNewFolder = false;
            this.newFolder.isNewFolder = false;
            this.newFolder.folderName = null;
            this.newFolder.isValid = null;
            this.newFolder.parentFolderID = null;
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

    onKeyDown(event, folder, val) {
        if (event.keyCode == 13) {
            if (val == 'New') {
                this.saveNewFolder(folder);
            }
            if (val == 'Edit') {
                this.editChildFolder(folder);
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
                folderId = [this.selectedFolders[this.selectedFolders.length - 1]][0]['folderNameID'];
            }
            if (folderId) {
                this._folderService.SearchInFolder({ searchText: this.fileFolderName, folderId: folderId }).subscribe((folderDetails: any) => {
                    if (folderDetails && (folderDetails.foldersList.length > 0 && folderDetails.foldersList[0].isValid) || (folderDetails.filesList.length > 0 && folderDetails.filesList[0].isValid)) {
                        folderDetails.foldersList = folderDetails.foldersList;
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
                });
            }

            //this.setParameter();
        } else {
            //modalContentAlert
            //this.modalAlertRef = this.modalService.show(this.modalContentAlert);
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
