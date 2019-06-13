import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { ContentComponent } from './content/content.component';
import { ContentService } from '../../../shared/services/content/content.service';
import { FoldersModule } from '../../pg/folders/folders.module';
import { GuidanceNoteService } from '../../../shared/services/guidance-note/guidance-note.service';

@NgModule({
    imports: [
      FormsModule, CommonModule, SharedModule, FoldersModule, RouterModule.forChild([
            {
                path: '', component: ContentComponent
            }
        ])
    ],
    declarations: [ContentComponent],
    providers: [ContentService, GuidanceNoteService]
})
export class ContentViewModule { }
