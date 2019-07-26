
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { PgModalService } from '../../services/pg-modal/pg-modal.service';
import { AuthService } from '../../services/auth/auth.service';
import { PracticeAreaService } from '../../services/practice-areas/practice-areas.service';
import { DataStoreService } from '../../services/data-store/data-store.service';
import { TocItemViewModel } from '../../models/practiceAreas/index';
import { FeedbackModel } from '../../models/user/feedback.model';
import { UserService } from '../../services/user/user.service';

@Component({
    selector: 'pg-modal',
    templateUrl: './pg-modal.component.html',
    styleUrls: ['./pg-modal.component.scss']
})
export class PgModalComponent implements OnInit {
    @ViewChild('autoShownModal') public autoShownModal: ModalDirective;
    public modalOpen: boolean = false;
    public feedbackOpen: boolean = false;
    @ViewChild('MatDialogReff') matDialog: TemplateRef<any>; 
    @ViewChild('feedbackModal') feedbackModal: TemplateRef<any>;
    practiceAreasList: TocItemViewModel[] = [];
    feedBackData: FeedbackModel = new FeedbackModel();
    dialogRef: MatDialogRef<any>;


    constructor(private modalService: PgModalService, public dialog: MatDialog, private _authService: AuthService, private _practiceAreaService: PracticeAreaService,
        private _dataStoreService: DataStoreService, private _userService: UserService
    ) { }

    ngOnInit() {
        this.feedBackData.issue = "Content Issue";
        this.modalService.getModal().subscribe((isOpen) => {
            this.modalOpen = isOpen as boolean;
            this.openDialog(this.matDialog);
        });

        this.modalService.getFeedbackModal().subscribe((isOpen) => {
            this.feedbackOpen = true;
            this.openFeedback(this.feedbackModal);
        });
    }

    openDialog(template: TemplateRef<any>) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        this.dialogRef = this.dialog.open(MatContentModal, { 'panelClass': 'unsubscribe-overlay', 'maxWidth': '700px' });
        this.dialogRef.afterClosed().subscribe(result => {
        });
    }


    hideModal() {
        this.modalOpen = false;
    }

    public onHidden(): void {
        this.modalOpen = false;
    }


    openFeedback(template: TemplateRef<any>) {
        if (this._authService.isLoggedIn) {
            let practiceAreas = this._dataStoreService.getSessionStorageItem("AllPracticeAreas");
            if (practiceAreas != undefined) {

                this.practiceAreasList = practiceAreas;
                const dialogConfig = new MatDialogConfig();
                dialogConfig.autoFocus = true;
                this.dialogRef = this.dialog.open(template, { 'panelClass': 'unsubscribe-overlay', 'maxWidth': '700px', disableClose: true });
                this.dialogRef.afterClosed().subscribe(result => {
                });
            }
            else {
                this._practiceAreaService.getPracticeAreasOnly().subscribe(data => {
                    this.practiceAreasList = data;
                    const dialogConfig = new MatDialogConfig();
                    dialogConfig.autoFocus = true;
                    this.dialogRef = this.dialog.open(MatContentModal, { 'panelClass': 'unsubscribe-overlay', 'maxWidth': '700px', disableClose: true });
                    this.dialogRef.afterClosed().subscribe(result => {
                    });
                });
            }
        }
    }


    validateNSubmitFeedback() {
        var isValidForm = true;

        if (this.feedBackData.name == null || this.feedBackData.name.trim() == "") {
            isValidForm = false;
        }

        if (this.feedBackData.email == null || this.feedBackData.email.trim() == "") {
            //"\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*"
            isValidForm = false;
        } else {
            let matched = this.feedBackData.email.match(new RegExp(/\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/));
            if (!matched || !matched[0]) {
                isValidForm = false;
            }
        }

        if (this.feedBackData.contactNumber == null || this.feedBackData.contactNumber.trim() == "") {
            isValidForm = false;
            //"\s*[0+]\d{9,20}|[0+]\d{2,4}\s\d{3}\s\d{4}\s*"
        } else {
            let matched = this.feedBackData.contactNumber.match(new RegExp(/\s*[0+]\d{9,20}|[0+]\d{2,4}\s\d{3}\s\d{4}\s*/));
            if (!matched || !matched[0]) {
                isValidForm = false;
            }
        }

        if (this.feedBackData.issue == null || this.feedBackData.issue.trim() == "") {
            isValidForm = false;
        }
        if (this.feedBackData.comments == null || this.feedBackData.comments.trim() == "") {
            isValidForm = false;
        }
        if (this.feedBackData.practiceArea == null || this.feedBackData.practiceArea.trim() == "") {
            isValidForm = false;
        }
        if (isValidForm) {
            this.dialogRef.close();
            this._userService.submitFeedback(this.feedBackData).subscribe(data => {

            });
        }
    }
}


@Component({
    selector: 'mat-content-modal',
    templateUrl: 'mat-content-modal.html',
})
export class MatContentModal { }
