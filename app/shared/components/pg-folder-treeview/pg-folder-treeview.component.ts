import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'pg-folder-treeview',
    templateUrl: './pg-folder-treeview.component.html',
    styleUrls: ['./pg-folder-treeview.component.scss']
})
export class PgFolderTreeviewComponent implements OnInit {

    constructor() { }

    @Input() folders;

    @Input() mainFolder;
    @Input() showClientDropdown: boolean = false;

    @Output() addNewFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() editFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() deleteFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() editClient: EventEmitter<any> = new EventEmitter<any>(); 
    @Output() setNodeCollapsed: EventEmitter<any> = new EventEmitter<any>(); 

    foldersCopy;

    mainFolderCopy;

    selectedParentId: number;

    isAddEdit: boolean = true;

    isAllFolderCollapsed: boolean = true;

    selectedFolder: any;

    @ViewChild('mainDiv') currentComponent;

    ngOnInit() {
    }

    nodeClicked(parentId) {
        this.folders = this.setSelectedRow(this.folders);
        this.selectedParentId = parentId;
        this.mainFolder.isSelected = false;
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

    newFolder = {
        "folderNameID": null,
        "folderName": "",
        "parentFolderID": null,
        "subscriberClientID": null,
        "subscriberID": null,
        "dateCreated": null,
        "lastAccessedDate": null,
        "isVisible": true,
        "isNewFolder": true,
        "folders": [],
        "files": []
    };

    addFolder() {
        this.isAddEdit = false;
        this.foldersCopy = JSON.parse(JSON.stringify(this.folders))
        if (this.isAllFolderCollapsed) {
            this.newFolder.subscriberClientID = this.mainFolder.subscriberClientId;
            this.folders.push(this.newFolder);
        }
        else {
            this.folders = this.searchFolders(this.folders);
        }
    }

    reNameFolder() {
        this.isAddEdit = false;
        this.foldersCopy = JSON.parse(JSON.stringify(this.folders));
        this.mainFolderCopy = Object.assign({}, this.mainFolder);
        if (this.isAllFolderCollapsed) {
            this.mainFolder.isEditEnabled = true;
        }
        else {
            this.enableEditFolders(this.folders);
        }
    }

    removeFolder() {
        this.deleteFolder.emit(this.selectedFolder);
    }

    searchFolders(folders) {
        if (folders.find(f => f.folderNameID == this.selectedParentId)) {
            var matchedfolder = folders.find(f => f.folderNameID == this.selectedParentId);
            this.newFolder.parentFolderID = matchedfolder.folderNameID;
            this.newFolder.subscriberClientID = matchedfolder.subscriberClientID;
            folders.find(f => f.folderNameID == this.selectedParentId).folders.push(this.newFolder);
            this.isAddEdit = false;
        }

        folders.forEach(f => {
            if (f.folders) {
                f.folders = this.searchFolders(f.folders);
            }
        });
        return folders;
    }

    setChildNodeCollapsed(folder) {
        this.selectedFolder = folder;
        this.isNodeCollapsed();
        this.setNodeCollapsed.emit(folder);
    }

    isNodeCollapsed() {
        this.isAllFolderCollapsed = true;
        var isAnyExpand = this.folders.find(f => f.isExpand == true);
        if (isAnyExpand)
            this.isAllFolderCollapsed = false;
    }

    cancelClicked() {
        var folders = this.foldersCopy;
        this.folders = folders;
        this.isAddEdit = true;
    }

    mainFolderClicked() {
        this.mainFolder.isSelected = !this.mainFolder.isSelected;
        this.isAllFolderCollapsed = true;
    }

    undoMainFolderChanges() {
        this.isAddEdit = true;
        this.mainFolder = this.mainFolderCopy;
    }

    enableEditFolders(folders) {
        if (folders.find(f => f.folderNameID == this.selectedParentId)) {
            folders.find(f => f.folderNameID == this.selectedParentId).isEditEnabled = true;
            this.isAddEdit = false;
        }

        folders.forEach(f => {
            if (f.folders) {
                f.folders = this.enableEditFolders(f.folders);
            }
        });
        return folders;
    }

    emitEditFolder(folder) {
        this.isAddEdit = true;
        this.editFolder.emit(folder);
    }

    emitNewFolder(folder) {
        this.isAddEdit = true;
        this.addNewFolder.emit(folder);
    }

    renameClient(client) {
        client.isEditEnabled = false;
        this.isAddEdit = true;
        this.editClient.emit(client);
    }
}
