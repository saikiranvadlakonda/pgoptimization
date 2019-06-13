import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { EssentialComponent } from './essential/essential.component';
import { EssentialService } from '../../../shared/services/essential/essential-service';
import { ContentService } from '../../../shared/services/content/content.service';
import { BsDropdownModule } from 'ngx-bootstrap';
//import { MatMenuModule } from '@angular/material';
import { FoldersModule } from '../../pg/folders/folders.module';

//angular material
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
    imports: [
        FormsModule,
        CommonModule,
        SharedModule,
        BsDropdownModule,
        MatMenuModule,
        MatTooltipModule,
        FoldersModule,
        MatRadioModule,
        RouterModule.forChild([
            {
                path: '', component: EssentialComponent
            }
        ])
    ],
    declarations: [EssentialComponent],
    providers: [EssentialService, ContentService]
})
export class EssentialViewModule { }

