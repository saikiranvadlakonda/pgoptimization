import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { FilterComponent } from './filter/filter.component';
import { ResultComponent } from './result/result.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { SearchService } from '../../../shared/services/search/search-service';
import { PopoverModule } from 'ngx-bootstrap';
import { ContentService } from '../../../shared/services/content/content.service';
import { FoldersService } from '../../../shared/services/folders/folders.service';
import { FoldersModule } from '../../../views/pg/folders/folders.module';
import { CollapseModule } from 'ngx-bootstrap';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        FoldersModule,
        PopoverModule.forRoot(),
        RouterModule.forChild([
            {
                path: '', component: SearchResultComponent
            }
        ]),
        CollapseModule.forRoot(),
    ],
    declarations: [FilterComponent, ResultComponent, SearchResultComponent],
    providers: [SearchService, ContentService, FoldersService]
})
export class SearchModule { }
