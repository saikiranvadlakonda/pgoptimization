import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { MyFoldersComponent } from './my-folders/my-folders.component';
import { FoldersService } from '../../../shared/services/folders/folders.service';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap/modal/modal.module';
import { ModalModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap';

@NgModule({
    imports: [
        CommonModule, SharedModule, FormsModule, NgbModalModule.forRoot(), RouterModule.forChild([
            {
                path: 'folders', redirectTo: 'my-folders'
            },
            {
                path: 'my-folders', component: MyFoldersComponent
            }
        ]),
        ModalModule.forRoot(),
        BsDropdownModule

    ],
    declarations: [MyFoldersComponent],
    providers: [FoldersService],
    exports: []
})
export class FoldersModule { }

