import { Component, OnDestroy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SpinnerService } from './pg-spinner.service';

@Component({
    selector: 'pg-spinner',
    templateUrl: './pg-spinner.component.html',
    styleUrls: ['./pg-spinner.component.css'],
})

export class PgSpinnerComponent implements OnDestroy, AfterViewChecked {

    show = false;
    private subscription: Subscription;

    constructor(
        private spinnerService: SpinnerService, private cdRef: ChangeDetectorRef
    ) {
        this.subscription = this.spinnerService.spinnerState()
            .subscribe((show: boolean) => {
                this.show = show;
                if(this.show)
                this.cdRef.detectChanges();
            });

    }

    ngOnDestroy() {

        this.subscription.unsubscribe();

    }

    ngAfterViewChecked() {
        this.cdRef.detectChanges();
    }

}

