import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { PermalinkViewComponent } from './permalink-view.component';

@NgModule({
  imports: [
      CommonModule, SharedModule, FormsModule, RouterModule.forChild([
          {
              path: '', component: PermalinkViewComponent
          }
          ])
  ],
  declarations: []
})
export class PermalinkViewModule { }
