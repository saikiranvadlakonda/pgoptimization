import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { PracticeAreaViewComponent } from './practice-area-view/practice-area-view.component';
import { SubTopicViewComponent } from './sub-topic-view/sub-topic-view.component';
import { PracticeAreasComponent } from './practice-areas/practice-areas.component';
import { PracticeAreaService } from '../../../shared/services/practice-areas/practice-areas.service';
import { DataStoreService } from '../../../shared/services/data-store/data-store.service';

//TODO: AuthGurad need to be implemnted

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, RouterModule.forChild([
    {
      path: '', component: PracticeAreasComponent
    }
  ])],
  declarations: [PracticeAreaViewComponent, SubTopicViewComponent, PracticeAreasComponent],

    providers: [PracticeAreaService, DataStoreService]
})
export class PracticeAreasModule { }
