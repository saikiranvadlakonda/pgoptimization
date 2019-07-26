import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BsDropdownModule, CollapseModule, ModalModule } from 'ngx-bootstrap';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule, MatRadioModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSelectModule, MatTooltipModule, MatMenuModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components

import { AppHeader1Component } from './components/app-header1/app-header1.component';
import { AppHeader2Component } from './components/app-header2/app-header2.component';
import { PracticeAreaSearchComponent } from './components/practice-area-search/practice-area-search.component';
import { FooterComponent } from './components/footer/footer.component';
import { PgSpinnerComponent } from './components/pg-spinner/pg-spinner.component';
import { PaginationComponent } from './components/pagination/paginatioin.component';
import { PgReadMoreComponent } from './components/pg-read-more/pg-read-more.component';
import { PgTabMenuComponent } from './components/pg-tab-menu/pg-tab-menu.component';
import { PgRepoTabMenuComponent } from './components/pg-Repotab-menu/pg-Repotab-menu.component';
import { EssentialsComponent } from './components/essentials/essentials.component';
import { RecentlyViewedComponent } from './components/recently-viewed/recently-viewed.component';
import { PgSpinnerSpecificComponent } from './components/pg-spinner-component-specific/pg-spinner-component-specific';
import { PGContentViewComponent } from './components/pg-content-view/pg-content-view.component';
import { PgFolderTreeviewComponent } from './components/pg-folder-treeview/pg-folder-treeview.component';
import { PgFolderTreeviewChildComponent } from './components/pg-folder-treeview-child/pg-folder-treeview-child.component';
import { BreadCrumbComponent } from './components/bread-crumb/bread-crumb.component';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
import { SaveToFolderModalComponent } from './components/save-to-folder-modal/save-to-folder-modal.component';
import { DownloadModalComponent } from './components/download-modal/download-modal.component';

// Directives
import { CompileDirective } from './directives/compile.directive';
//Pipes
import { FilterPipe } from './pipes/filter/filter.pipe';
import { FilterByPropertyPipe } from './pipes/filter-by-property/filter-by-property.pipe';
import { SafePipe } from './pipes/safe/safe.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { ContentSafePipe } from './pipes/content-safe/content-safe.pipe';


// Services

import { HTTP_INTERCEPTORS, HttpClient, HttpHandler, HttpClientModule } from '@angular/common/http';
import { PgInterceptor } from './services/http-helper/http-interceptor.service';
import { PgModalComponent, MatContentModal } from './components/pg-modal/pg-modal.component';
import { PgEmailModalComponent } from './components/pg-email-modal/pg-email-modal.component';
import { EmailMatContentModal } from './components/pg-email-modal/pg-email-modal.component';
import { FolderContainerComponent } from './components/folders/folder-container/folder-container.component';
import { FoldersListComponent } from './components/folders/folders-list/folders-list.component';
import { FolderDetailComponent } from './components/folders/folder-detail/folder-detail.component';
import { ErrorModalComponent } from './components/pg-error-modal/error-modal.component';
import { SearchService } from './services/search/search-service';
import { BackToTopComponent } from './components/back-to-top/back-to-top.component';
import { BackToTopDirective } from './directives/back-to-top.directive';
import { PermalinkModalComponent } from './components/permalink-modal/permalink-modal.component';
import { PgAlertModalComponent } from './components/pg-alert-modal/pg-alert-modal.component';
import { FoldersComponent } from './components/folders/folders/folders.component';
import { FilesComponent } from './components/folders/files/files.component';

const sharedComponents = [
    AppHeader1Component,
    AppHeader2Component,
    PracticeAreaSearchComponent,
    FooterComponent,
    PgSpinnerComponent,
    PaginationComponent,
    PgTabMenuComponent,
    PgRepoTabMenuComponent,
    FilterPipe,
    FilterByPropertyPipe,
    SafePipe,
    ContentSafePipe,
    TruncatePipe,
    PgReadMoreComponent,
    RecentlyViewedComponent,
    EssentialsComponent,
    PgSpinnerSpecificComponent,
    PGContentViewComponent,
    CompileDirective,
    PgFolderTreeviewComponent,
    PgFolderTreeviewChildComponent,
    PgModalComponent,
    MatContentModal,
    EmailMatContentModal,
    PgEmailModalComponent,
    FolderContainerComponent,
    FoldersListComponent,
    FolderDetailComponent,
    FoldersComponent,
    FilesComponent,
    ErrorModalComponent,
    BackToTopComponent,
    BackToTopDirective,
    BreadCrumbComponent,
    PdfViewerComponent,
    SaveToFolderModalComponent,
    DownloadModalComponent,
    PermalinkModalComponent,
    PgAlertModalComponent
];

@NgModule({
    imports: [
        HttpClientModule,
        RouterModule,
        CommonModule,
        FormsModule,
        BsDropdownModule,
        NgbModalModule.forRoot(),
        ModalModule.forRoot(),
        MatDialogModule,
        MatRadioModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule,
        MatSelectModule,
        MatTooltipModule,
        MatMenuModule,
        CollapseModule.forRoot(),
        NgbModule.forRoot()
    ],
    declarations: [
        sharedComponents
    ],
    entryComponents: [PgModalComponent, MatContentModal, PgEmailModalComponent, EmailMatContentModal],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: PgInterceptor,
            multi: true
        },
        HttpClient,
        sharedComponents,
        SearchService
    ],
    exports: [sharedComponents]
})
export class SharedModule { }
