import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { TocItemViewModel } from '../../../../shared/models/practiceAreas';
import { NavigationService } from '../../../../shared/services/navigation/navigation.service';
import { PgConstants } from '../../../../shared/constants/pg.constants';
import { StateParams } from '../../../../shared/models/state-params/state-params.model';
import { HistoryItem } from '../../../../shared/models/history/history-item.model';
import { CalendarEvent } from 'angular-calendar';
import { HistoryService } from '../../../../shared/services/history/history.service';
import { FoldersService } from '../../../../shared/services/folders/folders.service';
import { CalendarService } from '../../../../shared/services/calendar/calendar.service';
import { PracticeAreaService } from '../../../../shared/services/practice-areas/practice-areas.service';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { WhatsNewService } from '../../../../shared/services/whats-new/whats-new.service';
import { PgModalService } from '../../../../shared/services/pg-modal/pg-modal.service';
import { NewGroupEntity, NewItemEntity } from '../../../../shared/models/whats-new/new-group.model';
import { SubscriberFolderEntity } from '../../../../shared/models/folder';
import { Subject } from 'rxjs';
import { HistoryComponent } from '../history/history.component';
import { PgMessages } from '../../../../shared/constants/messages';
import { CalendarDateFormatter } from 'angular-calendar';
import { WeekdayFormatterService } from '../../../../shared/services/weekday-formatter/weekday-formatter';
import { PagerService } from '../../../../shared/services/pager/pager.service';
import { SearchService } from '../../../../shared/services/search/search-service';
/**
 Dashboard component 
 */
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    providers: [
        { provide: CalendarDateFormatter, useClass: WeekdayFormatterService }
    ]
})

export class DashboardComponent implements OnInit {
    /**
    To store Practice Areas
    */
    practiceAreas: TocItemViewModel[];
    historyList: HistoryItem[];
    timePeriods: string[] = [];
    tabsMenu = ['Browse Practice Areas', 'History', 'Calendar'];
    activeTab: number = 0;
    viewDate: Date = new Date();
    events: CalendarEvent<any, any>[] = [];
    calenderEvents: CalendarEvent<any, any>[] = [];
    folderInfo: SubscriberFolderEntity[];
    whatsNew: NewGroupEntity[];
    newItems: NewItemEntity[];
    firstSubscribedPA: string;
    subscribedPracticeArea: TocItemViewModel;
    newItemsLoaded: boolean = false;
    refresh: Subject<any> = new Subject();
    view: string = 'month';
    @ViewChild(HistoryComponent) historyComponent: HistoryComponent;
    eventsError: string;
    practiceAreaError: string;
    whatsNewError: string;
    foldersError: string;
    historyError: string;
    screenWidth: number;

    constructor(
        private _practiceAreaService: PracticeAreaService,
        private _hisotryService: HistoryService,
        private _foldersService: FoldersService,
        private _calendarService: CalendarService,
        private _navigationService: NavigationService,
        private _dataStoreService: DataStoreService,
        private _whatsNewService: WhatsNewService,
        private _modalService: PgModalService,
        private _pagerService: PagerService,
        private _searchService: SearchService
    ) {
        this.getScreenSize();
    }

    ngOnInit() {
        this._pagerService.setPageView();
        let today = new Date();
        let startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        let endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.getCalendarEvents(32, startDate, endDate, 'All');
    }

    @HostListener('window:resize', ['$event'])
    getScreenSize(event?) {
        this.screenWidth = window.screen.width;
    }
    /**
    Retrieves all the folders of logged in user.
     */
    getFolders() {        
        this._foldersService.getRootFolders().subscribe((rootFolders: any) => {
            if (rootFolders && rootFolders.length > 0 && rootFolders[0].isValid) {
                this.folderInfo = rootFolders;
                this._dataStoreService.setSessionStorageItem("ClientFolders", this.folderInfo);
                this.foldersError = undefined;               
            } else {
                this.folderInfo = [];
                this.foldersError = (Array.isArray(rootFolders) && rootFolders.length == 0) ? PgMessages.constants.folders.noFolders : PgMessages.constants.folders.error;
            }
            this._searchService.getSearchFilters().subscribe((filters) => {
                this._dataStoreService.setSessionStorageItem("searchFilters", filters);
            });
        });
    }
    /**
    To retrieve all the Practice Areas.
     */
    getPracticeAreas() {
        this._practiceAreaService.getPracticeAreas().subscribe((practiceAreas: any) => {
            this.getFolders();
            if (practiceAreas && practiceAreas.length > 0 && practiceAreas[0].isValid) {
                    this.setModulesAsPracticeAreas(practiceAreas);
                    this._dataStoreService.setSessionStorageItem("AllPracticeAreas", this.practiceAreas);
                    this.getWhatsNew();
                    this.practiceAreaError = undefined;                
            } else {
                this.practiceAreas = [];
                if ((Array.isArray(practiceAreas)) && practiceAreas.length == 0) {
                    this.practiceAreaError = PgMessages.constants.practiceArea.noPracticeAreas;
                    alert("You are not subscribed to Practical Guidance. Do you wish to view more information about this product?");
                } else {
                    this.practiceAreaError = PgMessages.constants.practiceArea.error;
                }
            }
        });
    }

    setModulesAsPracticeAreas(practiceAreas: TocItemViewModel[]): void {
        this.practiceAreas = [];
        practiceAreas.forEach((practiceArea: TocItemViewModel) => {
            if (practiceArea.type === 'MD') {
                let modules: TocItemViewModel[] = practiceArea.subTocItem.map((individualModule: TocItemViewModel) => {
                    individualModule.isSubscribed = practiceArea.isSubscribed;
                    individualModule['actualTitle'] = individualModule.title;

                    if (practiceArea.title.includes('Income Tax')) {
                        individualModule.title = 'Tax' + ' - ' + individualModule.title;
                    }
                    else if (practiceArea.title.includes('Real Estate')) {
                        individualModule.title = 'Real Estate' + ' - ' + individualModule.title;
                    }
                    else {
                        individualModule.title = practiceArea.title + ' - ' + individualModule.title;
                    }
                    return individualModule;
                });
                this.practiceAreas.push(...modules);
            } else {
                this.practiceAreas.push(practiceArea);
            }
            this._dataStoreService.setSessionStorageItem("AllModulesPAs", this.practiceAreas);

        });

        let subscribedPAs = this.practiceAreas.filter(pas => pas.isSubscribed);
        let unSubPAs = this.practiceAreas.filter(pas => !pas.isSubscribed);
        this.practiceAreas = [];
        this.practiceAreas.push(...subscribedPAs.sort((pa1, pa2) => pa1.title > pa2.title ? 1 : pa1.title === pa2.title ? 0 : -1));
        this.practiceAreas.push(...unSubPAs.sort((pa1, pa2) => pa1.title > pa2.title ? 1 : pa1.title === pa2.title ? 0 : -1));
    }

    getHistory() {
        this._hisotryService.getHistory().subscribe((history: any) => {
            if (history && history.length > 0 && history[0].isValid) {
                this.historyList = history;
                this.timePeriods = this.removeDuplicates(this.historyList, 'dateBadge');
                this.historyError = undefined;                
            } else {
                this.historyList = [];
                this.historyError = (Array.isArray(history) && history.length == 0) ? PgMessages.constants.history.noHistory : PgMessages.constants.history.error;
            }
        });
    }

    removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }

    getCalendarEvents(zoneId: number, startDate: Date, endDate: Date, eventTypeCode: string) {
        this._calendarService.getCalendarEvents(zoneId, startDate.toString(), endDate.toString(), eventTypeCode).subscribe(events => {
            if (events && events.length > 0 && events[0].isValid) {
                    this.events = events.map(event => {
                        return {
                            start: new Date(event.startDate),
                            end: new Date(event.endDate),
                            title: event.title,
                            color: PgConstants.constants.Colors[event.eventTypeCode],
                            eventCss: PgConstants.constants.EventTypeClass[event.eventTypeCode],
                            eventType: PgConstants.constants.EventType[event.eventTypeCode],
                            meta: {
                                notes: event.title
                            }
                        }
                    });
                    this.calenderEvents = this.events.map(event => event);
                    this.eventsError = undefined;                
            } else {
                this.events = [];
                this.calenderEvents = [];
                this.eventsError = (Array.isArray(events) && events.length == 0) ? PgMessages.constants.calendar.noEvents : PgMessages.constants.calendar.error;
            }
            this.getPracticeAreas();
        });
    }

    navigateToSubTopics(domainPath) {
        var selectedPracticeArea = this.practiceAreas.find(p => p.domainPath == domainPath);
        this._dataStoreService.setSessionStorageItem("SelectedPracticeArea", selectedPracticeArea);
        this._navigationService.navigate(PgConstants.constants.URLS.SubTopics.SubTopics, new StateParams(selectedPracticeArea));
    }
    
    navigateToMyFolders() {
        this._navigationService.navigate(PgConstants.constants.URLS.Folders.MyFolders);
    }

    navigateToHistoryList() {
        var input = { "historyList": this.historyList, "practiceAreas": this.practiceAreas };
        this._navigationService.navigate(PgConstants.constants.URLS.History.HistoryList, new StateParams(input));
    }

    navigateToCalendar() {
        this._dataStoreService.setSessionStorageItem("viewDate", this.viewDate);
        this._navigationService.navigate(PgConstants.constants.URLS.Calendar.Calendar);
    }
    
    getWhatsNew() {
        if (this._dataStoreService.getSessionStorageItem("AllWhatsNews") !== null) {
            this.newItems = this._dataStoreService.getSessionStorageItem("AllWhatsNews");
            this.newItemsLoaded = true;
            this.whatsNewError = (this.newItems.length == 0) ? PgMessages.constants.whatsNew.noWhatsNew : undefined;
        } else {
            this.firstSubscribedPA = "Test";
            let input = {
                "domainPath": "a2ioc", "tocItemType": "PA", "pageIndex": 0, "pageSize": 10
            };
            this._whatsNewService.getAllLatestWhatsNew(input).subscribe((whatsNew: any) => {
                if (whatsNew && whatsNew.length > 0 && whatsNew[0].isValid) {
                    this.newItems = whatsNew;
                    this._dataStoreService.setSessionStorageItem("WhatsNews", whatsNew);
                    this._dataStoreService.setSessionStorageItem("AllWhatsNews", whatsNew);
                    this.newItemsLoaded = true;
                    this.whatsNewError = undefined;                    
                } else {
                    this.newItems = [];
                    this.newItemsLoaded = true;
                    this.whatsNewError = (Array.isArray(whatsNew) && whatsNew.length == 0) ? PgMessages.constants.whatsNew.noWhatsNew : PgMessages.constants.whatsNew.error;
                }
            });
        }
    }

    showAllWhatsNew(eventData: any) {
        var inputNotedet = { "paTitle": undefined };
        this._navigationService.navigate(PgConstants.constants.URLS.WhatsNew.WhatsNew, new StateParams(inputNotedet));
    }

    viewDateChanged() {
        this.events = [];
        this.getCalendarEventsByClick();
    }   
    
    getCalendarEventsByClick() {
        const startDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
        const endDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
        this._calendarService.getCalendarEvents(32, startDate.toString(), endDate.toString(), 'All').subscribe(data => {
            if (data !== null) {
                this.events = data.map(s => {
                    return {
                        start: new Date(s.startDate),
                        end: new Date(s.endDate),
                        title: s.title,
                        color: PgConstants.constants.Colors[s.eventTypeCode],
                        meta: {
                            notes: s.title
                        },
                        description: s.description,
                        startDateDisplay: s.startDateDisplay,
                        endDateDisplay: s.endDateDisplay,
                        eventTypeDisplay: s.eventTypeDisplay,
                        eventType: PgConstants.constants.EventType[s.eventTypeCode],
                        eventCss: PgConstants.constants.EventTypeClass[s.eventTypeCode]
                    }
                });
                this.refresh.next();
            } else {
                this.events = [];
                this.refresh.next();
            }
        });
    }

    changedTab(evnt: any) {
        if (evnt != undefined && evnt.index == 1) {
            if (!this.historyList) {
                this.getHistory();
            }
        }
    }
    
    isStartDayOfEvent(day: any, event: any): boolean {
        let currentDate: Date = new Date(new Date(day.date).toLocaleDateString('en-US'));
        let eventStartDate: Date = new Date(new Date(event.start).toLocaleDateString('en-US'));
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
}
