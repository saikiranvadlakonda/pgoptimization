import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { PracticeAreaComponent } from './practice-area/practice-area.component';
import { HistoryComponent } from './history/history.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CalendarModule } from 'angular-calendar';
import { BrowseFoldersComponent } from './browse-folders/browse-folders.component';
import { FoldersService } from '../../../shared/services/folders/folders.service';
import { CalendarService } from '../../../shared/services/calendar/calendar.service';
import { PracticeAreaService } from '../../../shared/services/practice-areas/practice-areas.service';
import { HistoryService } from '../../../shared/services/history/history.service';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { ModalModule, CarouselModule } from 'ngx-bootstrap';
import { WhatsNewService } from '../../../shared/services/whats-new/whats-new.service';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../../shared/services/search/search-service';
import { WhatsnewCarouselComponent } from './whatsnew-carousel/whatsnew-carousel.component';

//angular material
import {
    MatTabsModule,
    MatTooltipModule
} from '@angular/material';

@NgModule({
    imports: [
        CommonModule, SharedModule, CalendarModule, FormsModule, RouterModule.forChild([
            {
                path: '', component: DashboardComponent
            }

        ]),
        NgbModalModule.forRoot(),
        ModalModule.forRoot(),
        CarouselModule.forRoot(),
        MatTabsModule,
        MatTooltipModule
    ],
    declarations: [
        PracticeAreaComponent,
        HistoryComponent,
        DashboardComponent,
        BrowseFoldersComponent,
        WhatsnewCarouselComponent
    ],
    providers: [
        FoldersService,
        PracticeAreaService, 
        CalendarService, 
        HistoryService, 
        WhatsNewService, 
        SearchService
    ],
    exports: [
        MatTabsModule
    ]
})
export class DashboardModule { }
