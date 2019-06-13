import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { MyFoldersComponent } from './my-folders/my-folders.component';
import { FolderDetailsComponent } from './folder-details/folder-details.component';
import { FoldersService } from '../../../shared/services/folders/folders.service';
//import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { ModalModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { FolderListComponent } from './folder-list/folder-list.component';
import { FolderContainerComponent } from './folder-container/folder-container.component';
import { FolderDetailComponent } from './folder-detail/folder-detail.component';
import { FolderParentComponent } from './folder-parent/folder-parent.component';
import { BsDropdownModule } from 'ngx-bootstrap';

@NgModule({
    imports: [
        CommonModule, SharedModule, FormsModule, NgbModalModule.forRoot(), RouterModule.forChild([
            {
                path: 'folders', redirectTo: 'my-folders'
            },
            {
                path: 'my-folders', component: MyFoldersComponent
            },
            {
                path: 'folder-details', component: FolderDetailsComponent
            }

        ]),
        ModalModule.forRoot(),
        BsDropdownModule

    ],
    declarations: [MyFoldersComponent, FolderDetailsComponent, FolderListComponent, FolderContainerComponent, FolderDetailComponent, FolderParentComponent],
    providers: [FoldersService],
    exports: [FolderDetailsComponent, FolderListComponent, FolderContainerComponent, FolderDetailComponent, FolderParentComponent]
})
export class FoldersModule { }

