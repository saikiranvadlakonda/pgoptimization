import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { HistoryListComponent } from './history-list/history-list.component';
import { HistoryService } from '../../../shared/services/history/history.service';
import { BsDropdownModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
      CommonModule, SharedModule, FormsModule, BsDropdownModule.forRoot(),RouterModule.forChild([
      {
        path: '', component: HistoryListComponent
      },     
      {
        path: 'history-list', component: HistoryListComponent
      }
    ])
  ],
  declarations: [HistoryListComponent],
  providers: [HistoryService]
})
export class HistoryModule { }
