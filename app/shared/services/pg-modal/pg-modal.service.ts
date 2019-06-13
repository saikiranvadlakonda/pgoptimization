import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class PgModalService {
    isShowing = false;
    modal = new Subject();
    showFeedback = false;
    feedbackModal = new Subject();

    getModal() {
        return this.modal;
    }
    open() {
        this.isShowing = true;
        this.modal.next(true);
    }
    close() {
        this.isShowing = false;
        this.modal.next(false);
    }
    closeModal() {
        this.close();
    }

    openFeedback() {
        this.showFeedback = true;
        this.feedbackModal.next(true);
    }

    getFeedbackModal() {
        return this.feedbackModal;
    }
}


