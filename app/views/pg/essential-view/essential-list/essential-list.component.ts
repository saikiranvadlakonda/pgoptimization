import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { PgMessages } from '../../../../shared/constants/messages';

@Component({
  selector: 'app-essential-list',
  templateUrl: './essential-list.component.html',
  styleUrls: ['./essential-list.component.scss']
})
export class EssentialListComponent implements OnInit {

  @Input() filteredEssentials: any;
  @Input() curPage: number;
  @Input() pages: any;
  @Input() pagesCount: any;
  @Input() error: string;
  @Output() pageSizeChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() essentialChecked: EventEmitter<any> = new EventEmitter<any>();
  @Output() openTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() downloadContent: EventEmitter<any> = new EventEmitter<any>();
  @Output() setToPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadPreviousPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadNextPage: EventEmitter<any> = new EventEmitter<any>();
  @Output() openSaveToFolderModal: EventEmitter<any> = new EventEmitter<any>();

  pgConstants: any = PgConstants.constants;
  pgMessages: any = PgMessages.constants;

  constructor() { }

  ngOnInit() {
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSizeChange.emit(pageSize);
  }

  onEssentialChecked(isChecked: boolean, result: any, isCallFromAddToDownload: boolean): void {
    let eventData: any = {
      isChecked: isChecked,
      result: result,
      isCallFromAddToDownload: isCallFromAddToDownload
    }
    this.essentialChecked.emit(eventData);
  }

  onOpenTab(essential: any): void {
    this.openTab.emit(essential);
  }

  onDownLoadContent(domainpath: string, hasChildren: boolean, forceDownload: boolean = false): void {
    let eventData: any = {
      domainpath: domainpath,
      hasChildren: hasChildren,
      forceDownload: forceDownload
    }
    this.downloadContent.emit(eventData);
  }

  onSetToPage(page: any, fromNav: boolean = false): void {
    let eventData: any = {
      page: page,
      fromNav: fromNav
    };
    this.setToPage.emit(eventData);
  }

  onLoadPreviousPage(): void {
    this.loadPreviousPage.emit();
  }

  onLoadNextPage(): void {
    this.loadNextPage.emit();
  }

  onOpenSaveToFolderModal(essential: any): void {
    this.openSaveToFolderModal.emit(essential);
  }

}
