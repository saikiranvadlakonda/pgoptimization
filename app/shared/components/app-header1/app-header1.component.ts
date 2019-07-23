import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { PgConstants } from '../../../shared/constants/pg.constants';
import { FeedbackModel } from '../../models/user/feedback.model';
import { PgModalService } from '../../services/pg-modal/pg-modal.service';
import { PagerService } from '../../services/pager/pager.service';

@Component({
  selector: 'app-header1',
  templateUrl: './app-header1.component.html',
  styleUrls: ['./app-header1.component.scss']
})
export class AppHeader1Component implements OnInit {

    feedBackData: FeedbackModel = new FeedbackModel();
    practiceAreasList;
    pgConstants = PgConstants.constants;
    
    constructor(
        private _authService: AuthService,
        private pgModalService: PgModalService,
        private _pager: PagerService
    ) { }

    ngOnInit() {
        this.feedBackData.issue = "Content Issue";
    }

    logout() {
        this._authService.logout();
    }

    openFeedbackModal() {
        this.pgModalService.openFeedback();
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
