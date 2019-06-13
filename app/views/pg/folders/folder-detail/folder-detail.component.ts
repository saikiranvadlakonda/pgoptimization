import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NewItemEntity } from '../../../../shared/models/whats-new/new-group.model';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { RenderContentRequest } from '../../../../shared/models/dashboard/content-request.model';
import { ContentService } from '../../../../shared/services/content/content.service';
import { FoldersService } from '../../../../shared/services/folders/folders.service';

@Component({
  selector: 'pg-folder-detail',
  templateUrl: './folder-detail.component.html',
    styleUrls: ['./folder-detail.component.scss'],
    providers: [ContentService]
})
export class FolderDetailComponent implements OnInit {

  constructor(
    private _dataStoreService: DataStoreService,
    private _navigationService: NavigationService,
    private _contentService: ContentService,
    private _folderService: FoldersService
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

  files;
  folders;
  foldersCopy;
  folderDataCopy;
  folderData;
  isEnableNewFolder: boolean = true;
  isEnableFolderEdit: boolean = false;
  fileFolderName;
  currentEditFolder;
  rendrContentRequest: RenderContentRequest = new RenderContentRequest();
  contentHTML;

  ngOnInit() {

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
      }
      else {
        this.folderData = JSON.parse(JSON.stringify(this.selectedFolders[this.selectedFolders.length - 1]));
        }
      this._folderService.getSelectedFoldersFiles(this.folderData.folderNameID).subscribe(data => {
          this.folderData.files = data.filesList;
          this.folderData.folders = data.foldersList;
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

  newFolderBtnClick() {
    this.foldersCopy = JSON.parse(JSON.stringify(this.folders));
    this.isEnableNewFolder = false;
    this.newFolder.isNewFolder = true;
    this.newFolder.folderName = null;
    this.newFolder.isValid = null;
    this.newFolder.parentFolderID = this.folderData.folderNameID;
    this.folders.unshift(this.newFolder);
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

  navigateToContent(url,title) {
    var file = new NewItemEntity();
    file.domainPath = url;
    file.hasChildren = "false";
    this._dataStoreService.setSessionStorageItem("selectedNewItem", file);
    this._dataStoreService.setSessionStorageItem("IsInlineDownload", true);
    this.setUrlFromDomainId(url,title);
  }

  private setUrlFromDomainId(domainId: string, title: string): void {
    if (this.isPgDomainPath(domainId)) {
      let isPgSubPracticeAreaItem = this.isPgSubPracticeAreaItem("", domainId);
      if (domainId.split('/').length === 5) {
        var input = { "subTopicDomainPath": domainId, "title": null, "practiceArea": null, rootArea: null };
        this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNote, new StateParams(input));
      }
      else if ((domainId.split('/').length > 5)) {
        if (domainId.indexOf('isMultiView') > -1) {
          var inputNote = { "title": null, "domainPath": domainId.split('|')[0] };
          this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(inputNote));
        }
        else {
          var inputNotedet = { "title": title, "domainPath": domainId };
          this._navigationService.navigate(PgConstants.constants.URLS.GuidanceNote.GuidanceNoteDetail, new StateParams(inputNotedet));
        }

      }

      else {
        this.getContent(domainId, title);
      }

    }
    else { this.getContent(domainId, title); }
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
  }

  editChildFolder(folder) {
    folder.isValid = null;
    if (!folder.folderName || folder.folderName.trim() == '') {
      folder.isValid = false;
    }
    else {
      var editConent = { "editFolder": folder, "parentFolder": this.folderData };
      this.EditFolder.emit(editConent);
    }
  }

  getDays(lastUpdateDate) {
    var today = new Date();
    var ldate = new Date(lastUpdateDate);
    var day = 1000 * 60 * 60 * 24;
    var diff = Math.floor(today.getTime() - ldate.getTime());
    return Math.floor(diff / day);
  }

  get FoldersCount() {
    var folders = this.folders.filter(f => f.isNewFolder == undefined);
    return folders.length;
  }

  popUpCloseClick() {
    this.popUpClose.emit(true);
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
}
