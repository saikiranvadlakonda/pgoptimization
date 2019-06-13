import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'angular-calendar';
import { CalendarComponent } from './calendar.component';
import { CalendarService } from '../../../shared/services/calendar/calendar.service';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { ModalModule } from 'ngx-bootstrap';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModalModule.forRoot(),
        CalendarModule.forRoot(),
        RouterModule.forChild([
            {
                path: '', component: CalendarComponent
            }
        ]),
        ModalModule.forRoot()
    ],
    declarations: [CalendarComponent],
    providers: [CalendarService]
})
export class CalendarFullModule { }