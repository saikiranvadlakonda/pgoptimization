import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { WhatsNewComponent } from './whats-new/whats-new.component';
import { WhatsNewService } from '../../../shared/services/whats-new/whats-new.service';
import { BsDropdownModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    BsDropdownModule.forRoot(),
    RouterModule.forChild([
      {
        path: '', component: WhatsNewComponent
      }
    ])
  ],
  declarations: [WhatsNewComponent],
  providers: [WhatsNewService]
})
export class WhatsNewViewModule { }
