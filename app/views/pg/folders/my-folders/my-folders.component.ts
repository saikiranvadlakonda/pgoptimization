import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FoldersService } from '../../../../shared/services/folders/folders.service'
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { FolderContainerComponent } from '../../../../shared/components/folders/folder-container/folder-container.component';


@Component({
  selector: 'my-folders',
  templateUrl: './my-folders.component.html',
  styleUrls: ['./my-folders.component.css']
})
export class MyFoldersComponent implements OnInit, AfterViewInit {
  @ViewChild(FolderContainerComponent) FolderContainerComponent: FolderContainerComponent;
  saveToFolderContent;
  viewType: string = "ClientList";
  foldersList = [];
  navigateToThisFolder;
 
  constructor(
    private _foldersService: FoldersService,
    private _dataStoreService: DataStoreService) { }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
      window.scroll(0, 0);
  }

  
  
  onSaveToFolderClick() {
  }

  onPopUpCloseClick() {
  }

  currentViewSelection(viewType) {
      this.viewType = viewType;
      window.scroll(0, 0);
  }

  navigateToBack() {
      this.FolderContainerComponent.selectedFolders.pop();
      this.FolderContainerComponent.selectedFoldersList.emit(this.FolderContainerComponent.selectedFolders);
      this.FolderContainerComponent.navigateToThisFolder(this.FolderContainerComponent.selectedFolders[this.FolderContainerComponent.selectedFolders.length - 1]);
  }

  selectedFoldersList(folders) {
    this.foldersList = folders;
  }

  navigateToThisFolderFromMyFolders(folder) {
      this.navigateToThisFolder = Object.assign({}, folder);
  }
}