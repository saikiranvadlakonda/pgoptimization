import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SpinnerService {

    public spinnerSubject: BehaviorSubject<any> = new BehaviorSubject<any>(false);
    spinnerDisabled: boolean;
    spinnerForce: boolean;
    constructor() { };

    show(force?: boolean) {
        if (force != undefined) {
            this.spinnerForce = force;
        }

        if (!this.spinnerDisabled) {

            this.spinnerSubject.next(true);
        }
    }

    hide(forceHide?: boolean) {
        if (!this.spinnerForce || forceHide) {
            this.spinnerForce = false;
            this.spinnerSubject.next(false);
        }

        
    }

    spinnerState(): Observable<any> {

        return this.spinnerSubject.asObservable();
    }

}
   