import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-pg-alert-modal',
  templateUrl: './pg-alert-modal.component.html',
  styleUrls: ['./pg-alert-modal.component.scss']
})
export class PgAlertModalComponent implements OnInit {

  modalRef: BsModalRef;
  messages: any[] = [];
  
  @Output() onCloseModal: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('alertModal') alertModal: TemplateRef<any>;

  constructor(private _modalService: BsModalService) { }

  ngOnInit() {
  }

  openModal(modalOptions: any, messages: any[]): void {
    this.messages = messages;
    this.modalRef = this._modalService.show(this.alertModal, modalOptions);
  }

  closeModal(): void {
    this.modalRef.hide();
    this.onCloseModal.emit();
  }

}
