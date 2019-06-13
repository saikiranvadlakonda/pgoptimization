import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pg-folder-treeview-child',
  templateUrl: './pg-folder-treeview-child.component.html',
  styleUrls: ['./pg-folder-treeview-child.component.scss']
})
export class PgFolderTreeviewChildComponent implements OnInit {

  constructor() { }

    @Input() subFolders;
    @Input() showFiles: boolean = true;
  @Output() nodeClicked: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  set mainFolderClick(_mainFolderClick: boolean) {
    if (_mainFolderClick)
      this.setSelectedRow(this.subFolders);
  }
  @Output() setNodeCollapsed: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() editFolders: EventEmitter<any> = new EventEmitter<any>();
  @Output() newFolders: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteFolder: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
  }

  showHideFolder(folderId, isVisible, parentFolderId, folder) {
    this.nodeClicked.emit((folderId) ? folderId : parentFolderId);
    var folderscopy = Object.assign([], this.subFolders);
    var subFolders = folderscopy.find(f => f.folderNameID == folderId);
    this.subFolders = this.setSelectedRow(this.subFolders);

    subFolders.isFilesVisible = !subFolders.isFilesVisible;
    if (subFolders.folders) {
      subFolders.folders.forEach(sf => {
        sf.isVisible = !sf.isVisible;
      });
    }
    subFolders.isSlected = true;
    if (!parentFolderId) {
      if (folder.isExpand != undefined) {
        folder.isExpand = !folder.isExpand;
      }
      else {
        folder.isExpand = true;
      }
    }

    
     
    this.setNodeCollapsed.emit(folder);
  }


  setSelectedRow(folders) {
    folders.forEach(f => {
      f.isSlected = false;
      if (f.folders) {
        f.folders = this.setSelectedRow(f.folders);
      }
    });
    return folders;
  }

  nodeChildClicked(parentId) {
    this.nodeClicked.emit(parentId);
  }

  nodeChildCollapsed(folder) {
    this.setNodeCollapsed.emit(folder);
  }

  childNodeCancelClicked() {
    this.cancelClicked.emit(true);
  }

  undoChanges() {
    this.cancelClicked.emit(null);
  }

  editFolder(folder) {
    this.editFolders.emit(folder);
  }

  newFolder(folder) {
    folder.isNewFolder = false;
    this.newFolders.emit(folder);
  }

  editChildFolder(folder) {
    this.editFolders.emit(folder);
  }

  addChildFolder(folder) {
    folder.isNewFolder = false;
    this.newFolders.emit(folder);
  }

  deleteChildFolder(folder) {
    this.deleteFolder.emit(folder);
  }

}
