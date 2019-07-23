import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-permalink-modal',
  templateUrl: './permalink-modal.component.html',
  styleUrls: ['./permalink-modal.component.scss']
})
export class PermalinkModalComponent implements OnInit {

  modalRef: BsModalRef;

  @Input() permaTitle: string;
  @Input() permaLink: string;
  @ViewChild('permaLinkModal') permaLinkModal: TemplateRef<any>;

  constructor(private _modalService: BsModalService) { }

  ngOnInit() {
  }

  openModal(modalOptions: any): void {
    setTimeout(function () {
      let inputElmnt = (document.querySelector("input#permalinkContent") as HTMLInputElement);
      inputElmnt.focus();
      inputElmnt.setSelectionRange(0, 200, "forward");//inputElmnt.value.length);
    }, 200);
    this.modalRef = this._modalService.show(this.permaLinkModal, modalOptions);
    this._modalService.onShown.subscribe((next, error, complete) => {
      try {
        (document.querySelector("input#permalinkContent") as HTMLInputElement).select();
      }
      catch (e) { }
    });
    this._modalService.onShow.subscribe((next, error, complete) => {
      try {
        (document.querySelector("input#permalinkContent") as HTMLInputElement).select();
      }
      catch (e) { }
    });
  }

  closeModal(): void {
    this.modalRef.hide();
  }

}
