import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FoldersService } from '../../../../shared/services/folders/folders.service';

@Component({
  selector: 'pg-folder-parent',
  templateUrl: './folder-parent.component.html',
  styleUrls: ['./folder-parent.component.scss']
})
export class FolderParentComponent implements OnInit {

    constructor(private _foldersService: FoldersService) { }
  @Input()
  set mainClientFolder(_clientFolder) {
    this.clientFolder = _clientFolder;
    this.getFolders();
  }
  get mainClientFolder() {
    return this.clientFolder;
  }

  parentFolders;
  clientFolder;
  clientFolderCopy;
  @Output() selectedParentFolder: EventEmitter<any> = new EventEmitter<any>();
  @Output() parentFolderBackClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() addNewParentFolder: EventEmitter<any> = new EventEmitter<any>();
  @Output() clientFolderEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() folderDelete: EventEmitter<any> = new EventEmitter<any>();
  @Output() EditParentFolder: EventEmitter<any> = new EventEmitter<any>();
  @Input() isSaveToFolder: boolean;
  isEnableClientEdit: boolean = false;
  isEnableNewFolder: boolean = true;

  folders;
  foldersCopy;
  checkedFolderId;
  currentEditFolder;
  parentFolderName;



  ngOnInit() {
  }

  getFolders() {
      this.folders = [];
      this.folders = this.clientFolder.folders;
    if (this.clientFolder.parentFolders) {
      this.clientFolder.parentFolders.forEach(f => {
        this.folders.push(f);
      });
    }
  }

  navigateToFolder(parentFolder) {
    if (!parentFolder.isNewFolder) {
      this.selectedParentFolder.emit(parentFolder);
    }
  }

  navigateBackToFolderList() {
    this.isEnableNewFolder = true;
    this.parentFolderBackClick.emit(true);
  }

  createParentFolderClick() {
    this.foldersCopy = JSON.parse(JSON.stringify(this.folders));
    this.newParentFolder.subscriberClientID = this.clientFolder.subscriberClientId;
    this.newParentFolder.isNewFolder = true;
    this.newParentFolder.folderName = null;
    this.newParentFolder.isValid = null;
    this.folders.unshift(this.newParentFolder);
    this.isEnableNewFolder = false;
  }

  cancelAddNewParentFolder() {
    this.folders = JSON.parse(JSON.stringify(this.foldersCopy));
    this.isEnableNewFolder = true;
  }

  saveNewParentFolder(folder) {
    folder.isValid = null;
    if (!folder.folderName || folder.folderName.trim() == '') {
      folder.isValid = false;
    }
    else {
      this.isEnableNewFolder = true;
      this.addNewParentFolder.emit(folder);
    }
  }

  clientEditClick() {
    this.clientFolderCopy = JSON.parse(JSON.stringify(this.clientFolder));
    this.isEnableClientEdit = true;
  }

  clientEdit() {
    this.isEnableClientEdit = false;
    this.clientFolderEdit.emit(this.clientFolder);
  }

  cancelClientEdit() {
    this.clientFolder = JSON.parse(JSON.stringify(this.clientFolderCopy));
    this.isEnableClientEdit = false;
  }

  onFolderCheck(folderId) {
    this.checkedFolderId = folderId;
  }

  deleteFolder(folder) {
    var deleteContent = { "deletedId": folder.folderNameID, "parentFolder": null };
    this.folderDelete.emit(deleteContent);
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

  newParentFolder = {
    "folderNameID": null,
    "folderName": null,
    "parentFolderID": null,
    "subscriberClientID": null,
    "subscriberID": null,
    "dateCreated": null,
    "lastAccessedDate": null,
    "isVisible": null,
    "isValid": null,
    "isNewFolder": null,
    "isEnableEdit": null,
    "folders": [],
    "files": []
  };

  editParent(folder) {
    folder.isValid = null;
    if (!folder.folderName || folder.folderName.trim() == '') {
      folder.isValid = false;
    }
    else
      var editConent = { "editFolder": folder, "parentFolder": null };
    this.EditParentFolder.emit(editConent);
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

  onKeyDown(event, folder, val) {
    if (event.keyCode == 13) {
      if (val == 'New') {
        this.saveNewParentFolder(folder);
      }
      if (val == 'Edit') {
        this.editParent(folder);
      }
    }
  }

}
