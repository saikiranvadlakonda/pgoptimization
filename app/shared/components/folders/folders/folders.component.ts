import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit {

  @Input() fromRoot: any;
  @Input() folders: any;
  @Input() forSearch: boolean;
  @Input() foldersSize: any;
  @Input() error: any;
  @Output() newFolderEnter: EventEmitter<any> = new EventEmitter<any>();
  @Output() addNewClient: EventEmitter<any> = new EventEmitter<any>();
  @Output() editClient: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelCreateClientFolder: EventEmitter<any> = new EventEmitter<any>();
  @Output() enableEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteClient: EventEmitter<any> = new EventEmitter<any>();
  @Output() showFolderDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() navigateToContent: EventEmitter<any> = new EventEmitter<any>();
  @Output() showMoreFolders: EventEmitter<any> = new EventEmitter<any>();
  @Output() showLessFolders: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  onKeyDown(event: KeyboardEvent, folder: any, isCreatingNewFolder: boolean): void {
    let eventData: any = {
      event: event,
      folder: folder,
      isCreatingNewFolder: isCreatingNewFolder
    };
    this.newFolderEnter.emit(eventData);
  }

  onAddNewClient(folder: any): void {
    this.addNewClient.emit(folder);
  }

  onEditClient(folder: any): void {
    this.editClient.emit(folder);
  }

  onCancelEdit(folder: any): void {
    this.cancelEdit.emit(folder);
  }

  onCancelCreateClientFolder(): void {
    this.cancelCreateClientFolder.emit();
  }

  onEnableEdit(folder: any): void {
    this.enableEdit.emit(folder);
  }

  onDeleteClient(folder: any): void {
    this.deleteClient.emit(folder);
  }

  onShowFolderDetails(folder: any): void {
    this.showFolderDetails.emit(folder);
  }

  onNavigateToContent(folder: any): void {
    this.navigateToContent.emit(folder);
  }

  onShowMoreFolders(): void {
    this.showMoreFolders.emit();
  }

  onShowLessFolders(): void {
    this.showLessFolders.emit();
  }

  getDays(lastUpdateDate): string {
    var today = new Date();
    var ldate = new Date(lastUpdateDate);
    var day = 1000 * 60 * 60 * 24;
    var diff = Math.floor(today.getTime() - ldate.getTime());
    if (Math.floor(diff / day) <= 0) {
      return (ldate.getHours() < 10 ? '0' + ldate.getHours() : ldate.getHours()) + ":" + (ldate.getMinutes() < 10 ? '0' + ldate.getMinutes() : ldate.getMinutes()) + ":" + (ldate.getSeconds() < 10 ? '0' + ldate.getSeconds() : ldate.getSeconds());
    }
    return Math.floor(diff / day) + " day(s) ago";
  }

}
