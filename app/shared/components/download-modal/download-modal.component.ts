import { Component, OnInit, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { PgConstants } from '../../constants/pg.constants';

@Component({
  selector: 'app-download-modal',
  templateUrl: './download-modal.component.html',
  styleUrls: ['./download-modal.component.scss']
})
export class DownloadModalComponent implements OnInit {

  fileTitle: string;
  isValidFileTitle: boolean = true;
  fileFormat: string;
  modalRef: BsModalRef;
  pgConstants: any = PgConstants.constants;

  @Output() downloadFile: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('downloadModal') downloadModal: TemplateRef<any>;

  constructor(private _modalService: BsModalService) { }

  ngOnInit() {
  }

  openModal(fileInfo: any, modalOptions: any): void {
    this.fileTitle = fileInfo.fileTitle;
    this.fileFormat = fileInfo.fileFormat;
    this.modalRef = this._modalService.show(this.downloadModal, modalOptions);
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  validate(): void {
    if (this.fileTitle != undefined && this.fileTitle != null && this.fileTitle.trim() != '') {
      this.isValidFileTitle = true;
      let eventData: any = {
        fileTitle: this.fileTitle,
        fileFormat: this.fileFormat
      };
      this.downloadFile.emit(eventData);
    } else {
      this.isValidFileTitle = false;
    }
  }

}
