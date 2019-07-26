import { Component, OnInit, ViewChild, TemplateRef, Inject } from '@angular/core';
import { EmailModalService } from '../../services/email-modal/email-modal.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EmailContent } from '../../../shared/models/email-modal/email-modal.model';
import { DataStoreService } from '../../../shared/services/data-store/data-store.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { PgConstants } from '../../constants/pg.constants';

@Component({
    selector: 'pg-email-modal',
    templateUrl: './pg-email-modal.component.html',
    styleUrls: ['./pg-email-modal.component.scss']
})
export class PgEmailModalComponent implements OnInit {
    @ViewChild('autoShownModal') public autoShownModal: ModalDirective;
    public modalOpen: boolean = false;
    @ViewChild('MatDialogReff') matDialog: TemplateRef<any>;
    @ViewChild('emailSuccessfulAlert') emailSuccessfulAlert: TemplateRef<any>;
    emailSuccessfulAlertRef: BsModalRef;
    emailData: EmailContent;
    pgConstants = PgConstants.constants;
    constructor(private modalService: EmailModalService,
        public dialog: MatDialog,
        private bsModalService: BsModalService,
        public _dataStoreService: DataStoreService
    ) { }

    ngOnInit() {
        this.modalService.getEmailContent().subscribe(data => {
            this.emailData = data;
        });

        this.modalService.getModal().subscribe((isOpen) => {
            this.modalOpen = isOpen as boolean;
            this.openDialog(this.matDialog);
        });
    }

    openDialog(template: TemplateRef<any>) {
        var userinfo = this._dataStoreService.getSessionStorageItem("userInfo");
        this.emailData.Recipients = userinfo.emailId;
        this.emailData.Format = "pdf";
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.width = "500px";
        dialogConfig.data = this.emailData;

        const dialogRef = this.dialog.open(EmailMatContentModal, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.emailData.Recipients = this.emailData.Recipients.replace(',', ';');
                this.modalService.sentContentEmail(this.emailData).subscribe(data => {
                    if (data) {
                        this.emailSuccessfulAlertRef = this.bsModalService.show(this.emailSuccessfulAlert, { backdrop: 'static', keyboard: false });
                    }
                });
            }
        });
    }

    hideModal() {
        this.modalOpen = false;
    }

    public onHidden(): void {
        this.modalOpen = false;
    }
}


@Component({
    selector: 'email-mat-dialog',
    templateUrl: 'pg-emailcontent-modal.html',
})
export class EmailMatContentModal {
    constructor(
        public dialogRef: MatDialogRef<EmailMatContentModal>,
        @Inject(MAT_DIALOG_DATA) public data: EmailContent) { }

    showValidationMsg: boolean = false;
    pgConstants = PgConstants.constants;

    get isRecepientValid(): boolean {
        var isValidRecepient = true;
        if (this.data && this.data.Recipients && this.data.Recipients.trim() != '') {
            var emailFormatRegExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
            var emailIds = this.data.Recipients.split(',');

            emailIds.forEach(email => {
                if (!emailFormatRegExp.test(email))
                    isValidRecepient = false;
            });

        }
        else
            isValidRecepient = false;

        return isValidRecepient;
    }

    get isValidSubject(): boolean {
        return (this.data && this.data.Subject && this.data.Subject.trim() != '') ? true : false;
    }

    validate() {
        this.showValidationMsg = true;
    }

    get IsValidForm(): boolean {
        return (this.isValidSubject && this.isRecepientValid) ? true : false;
    }
}



