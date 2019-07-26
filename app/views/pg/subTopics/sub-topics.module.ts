import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { SubTopicComponent } from './sub-topic/sub-topic.component';
import { CategoryComponent } from './category/category.component';
import { WhatsNewComponent } from './whats-new/whats-new.component';
import { SubTopicService } from '../../../shared/services/sub-topic/sub-topics.service';
import { MatTooltipModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
    imports: [
        CommonModule, SharedModule, MatTooltipModule, NgbModule.forRoot(), RouterModule.forChild([
            {
                path: '', component: SubTopicComponent
            }

        ])
    ],
    declarations: [
        SubTopicComponent,
        CategoryComponent,
        WhatsNewComponent
    ],
    providers: [SubTopicService]
})
export class SubTopicsModule { }
