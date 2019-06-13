/** angular modules import */
import { NgModule, ErrorHandler, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CalendarModule } from 'angular-calendar';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

/** App Routing Module import */
import { AppRoutingModule } from './routes/app-routing.module';

/** modules import */
import { SharedModule } from './shared/shared.module';
import { ImageSrcModule } from './views/pg/image-src/image-src.module';


/** App container component */
import { AppComponent } from './app.component';
import { LoginComponent } from './views/pg/account/login/login.component';
import { LogoutComponent } from './views/pg/account/logout/logout.component';
import { PermalinkViewComponent } from './views/pg/permalink-view/permalink-view.component';



/** shared services */
import { SpinnerService } from './shared/components/pg-spinner/pg-spinner.service';
import { NavigationService } from './shared/services/navigation/navigation.service';
import { DataStoreService } from './shared/services/data-store/data-store.service';
import { WhatsNewService } from './shared/services/whats-new/whats-new.service';
import { EssentialService } from './shared/services/essential/essential-service';

import { PagerService } from './shared/services/pager/pager.service';
import { AuthService } from './shared/services/auth/auth.service';
import { UserService } from './shared/services/user/user.service';
import { AuthGuard } from './shared/services/guards/auth.guard';
import { ModalService } from './shared/components/pg-modal/pg-modal.service';
import { EmailModalService } from './shared/services/email-modal/email-modal.service';
import { PracticeAreaService } from './shared/services/practice-areas/practice-areas.service';
import { ErrorModalService } from './shared/services/error-modal/error-modal.service';
import { WeekdayFormatterService } from './shared/services/weekday-formatter/weekday-formatter';
import { GuidanceNoteService } from './shared/services/guidance-note/guidance-note.service';
import { PgModalService } from './shared/services/pg-modal/pg-modal.service';
import { ContentViewReqService } from './shared/services/analytics/content-view-req.service';

/** ngrx store import */
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { routerReducer } from './store/router/reducers/router.reducer';
import { RouterProxy } from './store/router/proxy/router.proxy';


/* ngx-bootstrap*/

import { BsDropdownModule, CarouselModule, CollapseModule } from 'ngx-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



//angular material
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatExpansionModule,
  MatAutocompleteModule,
  MatButtonToggleModule,
  MatCardModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatGridListModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule,
  MatStepperModule,
  MatFormFieldModule,
  MatInputModule,
  MatToolbarModule
} from '@angular/material';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        LogoutComponent,
        PermalinkViewComponent
    ],
    imports: [BrowserModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        ImageSrcModule,
        CalendarModule.forRoot(),
        StoreModule.forRoot({
            routerState: routerReducer
        }),
        EffectsModule.forRoot([]),
        StoreDevtoolsModule.instrument({ maxAge: 25 }),
        AppRoutingModule,
        BsDropdownModule.forRoot(),
        CarouselModule.forRoot(),

        //angular material
        BrowserAnimationsModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatExpansionModule,
        MatAutocompleteModule,
        MatButtonToggleModule,
        MatCardModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatGridListModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatToolbarModule,
        NgbModule.forRoot()
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        AuthService,
        UserService,
        NavigationService,
        DataStoreService,
        SpinnerService,
        PagerService,
        RouterProxy,
        AuthGuard,
        ModalService,
        EmailModalService,
        PracticeAreaService,
        WhatsNewService,
        EssentialService,
        ErrorModalService,
        WeekdayFormatterService,
        GuidanceNoteService,
        PgModalService,
        ContentViewReqService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
