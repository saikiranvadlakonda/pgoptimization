import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { GuidanceNoteComponent } from './guidance-note/guidance-note.component';
import { GuidanceNoteDetailComponent } from './guidance-note-detail/guidance-note-detail.component';
import { SubTopicGuidanceComponent } from './sub-topic-guidance/sub-topic-guidance.component';
import { SubTopicReferenceComponent } from './sub-topic-reference/sub-topic-reference.component';
import { GuidanceNoteService } from '../../../shared/services/guidance-note/guidance-note.service';
import { ContentService } from '../../../shared/services/content/content.service';
import { FoldersService } from '../../../shared/services/folders/folders.service';
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
        CommonModule, SharedModule, FormsModule, FoldersModule, RouterModule.forChild([
            {
                path: '', component: GuidanceNoteComponent
            },
            {
                path: 'guidance-note-detail', component: GuidanceNoteDetailComponent
            }

      ]),
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
    ],
    declarations: [
        GuidanceNoteComponent,
        GuidanceNoteDetailComponent,
        SubTopicGuidanceComponent,
        SubTopicReferenceComponent
    ],
    providers: [GuidanceNoteService, ContentService, FoldersService],
  exports: [
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
  ]
})
export class GuidanceNoteModule { }
