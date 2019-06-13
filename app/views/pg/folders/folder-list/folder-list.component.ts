import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pg-folder-list',
  templateUrl: './folder-list.component.html',
  styleUrls: ['./folder-list.component.scss']
})
export class FolderListComponent implements OnInit {

  constructor() { }

  folderInfoCopy;

  @Input() folderInfo;
  @Input() isSaveToFolder: boolean;
  @Output() selectedFolder: EventEmitter<any> = new EventEmitter<any>();
  @Output() addNewClientFolder: EventEmitter<any> = new EventEmitter<any>();
  @Output() editClientFolder: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteClientFolder: EventEmitter<any> = new EventEmitter<any>();

  isEnableNewFolder: boolean = true;
  currentEditFolder;
  fileFolderName;

  ngOnInit() {
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
    this.isEnableNewFolder = false;
    this.folderInfoCopy = JSON.parse(JSON.stringify(this.folderInfo));
    this.folderInfo.unshift(this.newClientFolder);
  }

  cancelCreateClientFolder() {
    this.isEnableNewFolder = true;
    this.folderInfo = JSON.parse(JSON.stringify(this.folderInfoCopy));
  }

  addNewClient(folder) {
    this.isEnableNewFolder = true;
    this.addNewClientFolder.emit(folder);
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
    folder.isValid = null;
    folder.clientDescription = this.currentEditFolder.clientDescription;
    folder.isEnableEdit = null;
  }

  getDays(lastUpdateDate) {
    var today = new Date();
    var ldate = new Date(lastUpdateDate);
    var day = 1000 * 60 * 60 * 24;
    var diff = Math.floor(today.getTime() - ldate.getTime());
    return Math.floor(diff / day);
  }

  editClient(folder) {
    folder.isValid = null;
    if (!folder.clientDescription || folder.clientDescription.trim() == '') {
      folder.isValid = false;
    }
    else
      this.editClientFolder.emit(folder);
  }

  deleteClient(folder) {
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
}
