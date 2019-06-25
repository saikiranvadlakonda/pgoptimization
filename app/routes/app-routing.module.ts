import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { AuthGuard } from '../shared/services/guards/auth.guard';
import { PermalinkViewComponent } from '../views/pg/permalink-view/permalink-view.component';
import { LogoutComponent } from '../views/pg/account/logout/logout.component';
import { LoginComponent } from '../views/pg/account/login/login.component';

const APPROUTES: Routes = [

    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LogoutComponent },
    //{ path: 'login', loadChildren: 'app/views/pg/account/account.module#AccountModule' },
    { path: 'dashboard', canActivate: [AuthGuard], loadChildren: 'app/views/pg/dashboard-view/dashboard.module#DashboardModule' },
    //{ path: 'practice-areas', canActivate: [AuthGuard], loadChildren: 'app/views/pg/practiceAreas/practice-areas.module#PracticeAreasModule' },
    { path: 'search-results', canActivate: [AuthGuard], loadChildren: 'app/views/pg/search/search.module#SearchModule' },
    { path: 'sub-topics', canActivate: [AuthGuard], loadChildren: 'app/views/pg/subTopics/sub-topics.module#SubTopicsModule' },
    { path: 'guidance-note', canActivate: [AuthGuard], loadChildren: 'app/views/pg/guidanceNote/guidance-note.module#GuidanceNoteModule' },
    { path: 'folders', canActivate: [AuthGuard], loadChildren: 'app/views/pg/folders/folders.module#FoldersModule' },
    { path: 'history-list', canActivate: [AuthGuard], loadChildren: 'app/views/pg/history/history.module#HistoryModule' },
    { path: 'calendar', canActivate: [AuthGuard], loadChildren: 'app/views/pg/calendar/calendar.module#CalendarFullModule' },
    { path: 'essential', canActivate: [AuthGuard], loadChildren: 'app/views/pg/essential-view/essential-view.module#EssentialViewModule' },
    { path: 'whats-new', canActivate: [AuthGuard], loadChildren: 'app/views/pg/whats-new-view/whats-new-view.module#WhatsNewViewModule' },
    { path: 'content-view', canActivate: [AuthGuard], loadChildren: 'app/views/pg/content-view/content-view.module#ContentViewModule' },
    { path: 'permalink-view', component: PermalinkViewComponent}

];

@NgModule({
    imports: [CommonModule, FormsModule,
        RouterModule.forRoot(APPROUTES, { preloadingStrategy: PreloadAllModules })
    ],
    providers: [],
    exports: [
        RouterModule,
    ],
    declarations: []

})

export class AppRoutingModule { }
