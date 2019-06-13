import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { ErrorModalService } from '../../services/error-modal/error-modal.service';
import { ErrorContent } from '../../models/error-content/error-content.model';

@Component({
    selector: 'pg-error-modal',
    templateUrl: './error-modal.component.html'
})

export class ErrorModalComponent implements OnInit {
    modalData: ErrorContent;
    errorModalRef: BsModalRef;
    @ViewChild('errorModal') errorModal: TemplateRef<any>;
    constructor(private modalService: BsModalService, private _errorModalService: ErrorModalService) { }

    ngOnInit(): void {
        this._errorModalService.modal.subscribe((isShow: boolean) => {
            if (isShow) {
                this.openModal();
            } else {
                this.closeModal();
            }
        });

        this._errorModalService.modalContent.subscribe((modalData: ErrorContent) => {
            this.modalData = modalData;
        });
    }

    openModal(): void {
        this.errorModalRef = this.modalService.show(this.errorModal, { backdrop: 'static', keyboard: false });
    }

    callBack(): void {
        if (this.modalData.showCancel) {
            this.modalData.callBack();
        }
        this.closeModal();
    }

    closeModal(): void {
        this._errorModalService.onCloseModal();
        this.errorModalRef.hide();
    }
}