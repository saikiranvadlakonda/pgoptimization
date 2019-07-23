import { Component, OnInit, Input, TemplateRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-save-to-folder-modal',
  templateUrl: './save-to-folder-modal.component.html',
  styleUrls: ['./save-to-folder-modal.component.scss']
})
export class SaveToFolderModalComponent implements OnInit {

  @Input() saveToFolderContent: any;
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() saveToFolder: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('saveToFolderModal') saveToFolderModal: TemplateRef<any>;
  loadFolders: boolean;
  modalRef: BsModalRef;

  constructor(private _modalService: BsModalService) { }

  ngOnInit() {
  }

  openModal(modalOptions: any): void {
    this.loadFolders = true;
    this.modalRef = this._modalService.show(this.saveToFolderModal, modalOptions);
  }

  onCloseModal(eventData: any): void {
    this.loadFolders = false;
    this.closeModal.emit(eventData);
    this.modalRef.hide();
  }

  onSaveToFolder(eventData: any): void {
    this.saveToFolder.emit(eventData);
  }

}
