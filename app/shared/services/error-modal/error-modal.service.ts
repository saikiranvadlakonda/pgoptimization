import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { ErrorContent } from '../../models/error-content/error-content.model';

@Injectable()

export class ErrorModalService {
    modal = new Subject();
    modalContent = new Subject<ErrorContent>();
    modalOpened: boolean = false;

    constructor() { }

    open(params: ErrorContent): void {
        this.modalOpened = true;
        this.modalContent.next(params);
        this.modal.next(true);
    }

    onCloseModal(): void {
        this.modalOpened = false;
    }

    isModalOpened(): boolean {
        return this.modalOpened;
    }
}