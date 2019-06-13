import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, OnChanges } from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { CalendarService } from '../../../shared/services/calendar/calendar.service';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { PgConstants } from '../../../shared/constants/pg.constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { DataStoreService } from '../../../shared/services/data-store/data-store.service';
import { PagerService } from '../../../shared/services/pager/pager.service';
import { CalendarDateFormatter } from 'angular-calendar';
import { WeekdayFormatterService } from '../../../shared/services/weekday-formatter/weekday-formatter';

@Component({
    selector: 'calendar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.css'],
    providers: [
        { provide: CalendarDateFormatter, useClass: WeekdayFormatterService }
    ]
})
export class CalendarComponent implements OnInit {
    @ViewChild('modalContent') modalContent: TemplateRef<any>

    view: string = 'month';
    viewDate: Date = new Date();
    events: CalendarEvent[] = [];
    eventsWithNoTitle: CalendarEvent[] = [];

    refresh: Subject<any> = new Subject();

    activeDayIsOpen: boolean = true;

    modalData: {
        event: CalendarEvent;
    };

    modalRef: BsModalRef;



    constructor(private _calendarService: CalendarService, private _dataStoreService: DataStoreService, private modal: NgbModal, private modalService: BsModalService,
        private _pagerService: PagerService) { }


    ngOnInit() {
        var dat = this._dataStoreService.getSessionStorageItem("viewDate");
        if (dat != null) {
            this.viewDate = new Date(dat);
        }
        this.getCalendarEvents();
        //window.scrollTo(0, 0);
        this._pagerService.setPageView();
        /*
        let scrollEle = document.getElementById('newpg');
        try {
            if (window.navigator.userAgent.indexOf("Edge") == -1)
                scrollEle.scrollTo(0, 0);
            else
                scrollEle.scrollIntoView();
        } catch (e) {
        }*/
    }

    viewDateChanged() {
        this.reset();
    }

    reset() {
        this.events = [];
        this.eventsWithNoTitle = [];
        this.getCalendarEvents();
    }

    getCalendarEvents() {
        const startDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
        const endDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
        this._calendarService.getCalendarEvents(32, startDate.toString(), endDate.toString(), 'All').subscribe((events: any) => {
            if (events && events.length > 0) {
                if (events[0].isValid) {
                    this.events = events.map(event => {
                        return {

                            //start: addHours(new Date(s.startDate), 8),
                            //end: addHours(new Date(s.endDate), 17),  
                            start: new Date(event.startDate),
                            end: new Date(event.endDate),
                            title: event.title,
                            color: PgConstants.constants.Colors[event.eventTypeCode],
                            meta: {
                                notes: event.title
                            },
                            // allDay: true,
                            description: event.description,
                            startDateDisplay: event.startDateDisplay,
                            endDateDisplay: event.endDateDisplay,
                            eventTypeDisplay: event.eventTypeDisplay,
                            eventCss: PgConstants.constants.EventTypeClass[event.eventTypeCode]
                        }
                    });

                    this.eventsWithNoTitle = events.map(event => {
                        return {

                            //start: addHours(new Date(s.startDate), 8),
                            //end: addHours(new Date(s.endDate), 17),  
                            start: new Date(event.startDate),
                            end: new Date(event.endDate),
                            title: '',
                            color: PgConstants.constants.Colors[event.eventTypeCode],
                            meta: {
                                notes: event.title
                            },
                            // allDay: true,
                            description: event.description,
                            startDateDisplay: event.startDateDisplay,
                            endDateDisplay: event.endDateDisplay,
                            eventTypeDisplay: event.eventTypeDisplay,
                            eventCss: PgConstants.constants.EventTypeClass[event.eventTypeCode]
                        }
                    });
                } else {
                    this.events = [];
                    this.eventsWithNoTitle = [];
                }
            } else {
                this.events = [];
                this.eventsWithNoTitle = [];
            }
            this.refresh.next();
        });
    }

    isStartDayOfEvent(day: any, event: any): boolean {
        let currentDate: Date = new Date(new Date(day.date).toLocaleDateString('en-US'));
        let eventStartDate: Date = new Date(new Date(event.start).toLocaleDateString('en-US'));
        let eventEndDate: Date = new Date(new Date(event.end).toLocaleDateString('en-US'));
        if (eventStartDate.getTime() == currentDate.getTime() || day.isWeekend) {
            return true;
        }
        return false;
    }

    getCalDayWidth(day: any, event: any): number {
        let currentDate: Date = new Date(new Date(day.date).toLocaleDateString('en-US'));
        let eventStartDate: Date = new Date(new Date(event.start).toLocaleDateString('en-US'));
        let eventEndDate: Date = new Date(new Date(event.end).toLocaleDateString('en-US'));

        if (eventStartDate.getTime() == currentDate.getTime() || day.isWeekend) {
            let dateDifference: number = ((eventEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            let weekDay: number = eventEndDate.getDay();
            let totalweekDays: number = 7;
            if ((totalweekDays - weekDay) < dateDifference) {
                return (((totalweekDays - weekDay) * 100) - 1);
            }
            return ((dateDifference * 100) - 1);
        }
        return 0;
    }

    handleEvent(event: CalendarEvent, template: TemplateRef<any>): void {
        this.modalData = { event };
        this.openModal(template);
    }

    openModal(template: TemplateRef<any>) {

        this.modalRef = this.modalService.show(template);
    }

    formatDate(viewDate) {
        let date = new Date(viewDate);

        let formatter = new Intl.DateTimeFormat('en-us', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return formatter.format(date);

    }

}
