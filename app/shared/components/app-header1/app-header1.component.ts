import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { AuthService } from '../../../shared/services/auth/auth.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { FeedbackModel } from '../../models/user/feedback.model';
import { PracticeAreaService } from '../../services/practice-areas/practice-areas.service';
import { UserService } from '../../services/user/user.service';
import { PagerService } from '../../services/pager/pager.service';
import { PgModalService } from '../../services/pg-modal/pg-modal.service';

@Component({
  selector: 'app-header1',
  templateUrl: './app-header1.component.html',
  styleUrls: ['./app-header1.component.scss']
})
export class AppHeader1Component implements OnInit {
    feedbackModalRef: BsModalRef;
    feedBackData: FeedbackModel = new FeedbackModel();
    @ViewChild('feedbackModal') feedbackModalContent: TemplateRef<any>;
    practiceAreasList;
    constructor(
        private _authService: AuthService,
        private modal: NgbModal,
        private modalService: BsModalService,
        private _practiceAreaService: PracticeAreaService,
        private _userService: UserService,
        private _pager: PagerService,
        private pgModalService: PgModalService
    ) { }
    ngOnInit() {
        this.feedBackData.issue = "Content Issue";
    }
    logout() {
        this._authService.logout();
        
    }

    openFeedbackModal(template: TemplateRef<any>) {
        this.pgModalService.openFeedback();

        //if (this._authService.isLoggedIn) {
        //    this._practiceAreaService.getPracticeAreasOnly().subscribe(data => {
        //        this.practiceAreasList = data;
        //    });
        //}
        //this.feedbackModalRef = this.modalService.show(template, { backdrop: 'static', keyboard: false });
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
            var matched = this.feedBackData.email.match(new RegExp(/\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/));
            if (!matched || !matched[0]) {
                isValidForm = false;
            }
        }

        if (this.feedBackData.contactNumber == null || this.feedBackData.contactNumber.trim() == "") {
            isValidForm = false;
            //"\s*[0+]\d{9,20}|[0+]\d{2,4}\s\d{3}\s\d{4}\s*"
        } else {
            var matched = this.feedBackData.contactNumber.match(new RegExp(/\s*[0+]\d{9,20}|[0+]\d{2,4}\s\d{3}\s\d{4}\s*/));
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
            this.feedbackModalRef.hide();
            this._userService.submitFeedback(this.feedBackData).subscribe(data => {
            });
        }
    }

    redirectToLibrary() {
        this._authService.redirectedToLibrary().subscribe((redirectUrl) => {
            if (redirectUrl) {
                if (redirectUrl.redirectUrl)
                    window.location.href = redirectUrl.redirectUrl.m_StringValue;
            }
        });
    }
}
