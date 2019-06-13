import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { DataStoreService } from '../../../../shared/services/data-store/data-store.service';
import { UserViewModel } from '../../../../shared/models/user/user.model';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
    userProfile: UserViewModel = new UserViewModel();
    constructor(private _authService: AuthService, private _dataStoreService: DataStoreService) { }

    ngOnInit() {
        this.userProfile = this._dataStoreService.getSessionStorageItem("userInfo");
        if (this.userProfile != null) {
            this.userProfile.isAuthenticated = false;
            this._dataStoreService.setSessionStorageItem("logout", true);
        }
        this._dataStoreService.clearSessionStorage();
        //this._dataStoreService.clearSessionStorage();
        this.logout();
  }
    logout() {
        //this._authService.logout();
        window.parent.postMessage("Logout", "*");
    }
}
