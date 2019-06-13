import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UserService } from '../../../shared/services/user/user.service';

@NgModule({
    imports: [
        CommonModule, SharedModule, RouterModule.forChild([
            {
                path: '', component: LoginComponent
            }

        ]),
    ],
    declarations: [LoginComponent],
    providers: [AuthService, UserService]
})
export class AccountModule { }
